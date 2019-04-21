import passport from 'passport'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as TwitterStrategy } from 'passport-twitter'
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'

import socialConfig from './socialConfig'
import joinDelete from '../../lib/data/joinDelete'
import { read, update, create, destroy } from '../../lib/data/functions'
import { user } from '../../lib/data/userObj'
import { looseAsync } from '../../lib/data/loose'
import validEmail from '../../lib/data/validEmail'
import { hashAsync } from '../../lib/security/hash'
import config from '../../config'
import { randomIDAsync } from '../../lib/security/randomID'
import sendEmail from '../../lib/email'
import sendSMS from '../../lib/phone'
import log from '../../lib/debug/log'
import error from '../../lib/debug/error'
import { authAsync } from '../../lib/security/auth'
import { t, setLocaleAsync } from '../../lib/translations'
import countries from '../../lib/data/countries'
import { createSchema, userUpdate, userDestroy, userGet, socialSchema, setRoleSchema } from './schema'

const sendEmailConfirmation = async (email, done) => {
  const token = await randomIDAsync(32).catch(() => done(t('error_confirmation_generate')))
  const subject = t('account_confirm_subject', { company: config.company })
  const msg = t('account_confirm_message', { company: config.company, baseUrl: config.baseUrl, code: token })
  const obj = {
    email,
    token,
    type: config.mainConfirm,
    expiry: Date.now() + 1000 * 60 * 60
  }

  await create('confirms', token, obj).catch(() => done(t('error_confirmation_save')))
  sendEmail(email, subject, msg, (err) => {
    if (!err.error) {
      done(false)
    } else {
      done(err)
    }
  })
}

const sendPhoneConfirmation = async (phone, email, done) => {
  const token = await randomIDAsync(6).catch(() => done(t('error_confirmation_generate')))
  const msg = t('account_confirm_phone', { company: config.company, code: token })
  const obj = {
    email,
    token,
    expiry: Date.now() + 1000 * 60 * 60
  }

  await create('confirms', token, obj).catch(() => done(t('error_confirmation_save')))
  sendSMS(phone, msg, (err) => {
    if (!err.error) {
      done(false)
    } else {
      done(err)
    }
  })
}

export const get = async (data, done) => {
  const valid = await userGet.isValid(data.payload)
  if (valid) {
    await setLocaleAsync(data)
    const tokenData = await authAsync(data).catch(() => done(403, { error: t('unauthorized') }))
    const userData = await read('users', tokenData.email).catch(() => done(404, { error: t('error_no_user') }))
    delete userData.password
    done(200, userData)
  } else {
    done(400, { error: t('error_required') })
  }
}

const createUser = async (obj, done) => {
  const hashedPassword = await hashAsync(obj.password).catch(() => done(t('error_hash')))
  if (hashedPassword) {
    const now = Date.now()
    const newObj = {
      firstName: obj.firstName ? obj.firstName : '',
      lastName: obj.lastName ? obj.lastName : '',
      dialCoode: obj.dialCode,
      phone: obj.phone ? obj.phone : '',
      email: obj.email,
      tosAgreement: obj.tosAgreement,
      password: hashedPassword,
      referred: [],
      address: obj.address,
      zipCode: obj.zipCode,
      city: obj.city,
      country: obj.country ? countries.filter(i => i === obj.country).country : '',
      dob: obj.dob,
      avatarUrl: obj.avatarUrl,
      confirmed: {
        email: false,
        phone: false
      },
      social: {
        facebook: '',
        twitter: '',
        google: '',
        linkedin: ''
      },
      registeredAt: now,
      updatedAt: now,
      role: 'user'
    }

    await create('users', obj.email, newObj).catch(() => done(t('error_user_create')))
    if (config.mainConfirm === 'email') {
      await sendEmailConfirmation(obj.email, (err) => {
        if (!err.error) {
          done(false)
        } else {
          done(t('error_email'))
        }
      })
    }

    if (config.mainConfirm === 'phone') {
      await sendPhoneConfirmation(obj.phone, obj.email, (err) => {
        if (!err.error) {
          done(false)
        } else {
          done(t('error_sms'))
        }
      })
    }
  }
}

export const gen = async (data, done) => {
  const valid = await createSchema.isValid(data.payload)
  if (valid) {
    await setLocaleAsync(data)
    const u = await user(data).catch(() => done(400, { error: t('error_required') }))
    if (u.email && u.password && u.tosAgreement) {
      await read('users', u.email).catch(() => done(400, { error: t('error_user_exists') }))
      await createUser(u, (err) => {
        if (!err) {
          done(200, { status: t('ok') })
        } else {
          done(500, { error: err })
        }
      })
    } else {
      done(400, { error: t('error_required') })
    }
  } else {
    done(400, { error: t('error_required') })
  }
}

const editFields = async (u, userData, done) => {
  if (u.firstName !== userData.firstName) {
    userData.firstName = u.firstName
  }

  if (u.address !== userData.address) {
    userData.address = u.address
  }

  if (u.city !== userData.city) {
    userData.city = u.city
  }

  if (u.country !== userData.country) {
    userData.country = u.country
  }

  if (u.lastName !== userData.lastName) {
    userData.lastName = u.lastName
  }

  if (u.avatarUrl !== userData.avatarUrl) {
    userData.avatarUrl = u.avatarUrl
  }

  if (u.dob !== userData.dob) {
    userData.dob = u.dob
  }

  if (u.zipCode !== userData.zipCode) {
    userData.zipCode = u.zipCode
  }

  if (u.dialCode !== userData.dialCode) {
    userData.dialCode = u.dialCode
  }

  if (u.phone !== userData.phone) {
    userData.phone = u.phone
  }

  if (u.email !== userData.email) {
    validEmail(u.email, (email) => {
      if (email) {
        userData.email = u.email
        sendEmailConfirmation(u.email, (err) => {
          if (!err) {
            log('Email sent.')
          } else {
            error(err)
          }
        })
      }
    })
  }

  userData.updatedAt = Date.now()

  if (u.password) {
    const hashed = await hashAsync(u.password).catch(() => done(t('error_hash')))
    if (hashed) {
      userData.password = hashed
    }
  }
  done(false, userData)
}

const _update = async (data, tokenData, done) => {
  const u = await looseAsync(data, undefined).catch(() => done(400, { error: t('error_required') }))
  const userData = await read('users', tokenData.email).catch(() => done(500, { error: t('error_cannot_read') }))
  if (userData.confirmed.email || userData.confirmed.phone) {
    await editFields(u, userData, async (err, newData) => {
      if (!err && newData) {
        await update('users', tokenData.email, newData).catch(() => done(500, { error: t('error_cannot_update') }))
        const returnUuser = await read('users', tokenData.email).catch(() => done(500, { error: t('error_cannot_read') }))
        delete returnUuser.password
        done(200, returnUuser)
      } else {
        done(500, { error: t('error_unknown') })
      }
    })
  } else {
    done(400, { error: t('error_confirmed') })
  }
}

export const edit = async (data, done) => {
  const valid = await userUpdate.isValid(data.payload)
  if (valid) {
    await setLocaleAsync(data)
    const tokenData = await authAsync(data).catch(() => done(403, { error: t('unauthorized') }))
    await _update(data, tokenData, (status, outData) => {
      done(status, outData)
    })
  } else {
    done(400, { error: t('error_required') })
  }
}

export const destroyUser = async (data, done) => {
  const valid = await userDestroy.isValid(data.payload)
  if (valid) {
    await setLocaleAsync(data)
    const tokenData = await authAsync(data).catch(() => done(403, { error: t('unauthorized') }))
    const userData = await read('users', tokenData.email).catch(() => done(400, { error: t('error_no_user') }))
    const refs = typeof userData.referred === 'object' && Array.isArray(userData.referred) ? userData.referred : []
    // delete any associated tables
    // const orders = typeof userData.orders === 'object' && Array.isArray(userData.orders) ? userData.orders : []
    await destroy('users', tokenData.email).catch(() => done(500, { error: t('error_user_delete') }))
    joinDelete('refers', refs, (err) => {
      if (err) {
        error(err)
      } else {
        done(200, { status: t('ok') })
      }
    })
  } else {
    done(400, { error: t('error_required') })
  }
}

export const confirmPhone = (data, done) => {

}

const facebook = async (data, done) => {
  passport.use(new FacebookStrategy({
    clientID: socialConfig.facebook.clientID,
    clientSecret: socialConfig.facebook.clientSecret,
    callbackURL: socialConfig.facebook.callbackURL }, async (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    const userData = await read('users', profile.email).catch(async () => {
      const now = Date.now()
      const u = {
        profile,
        firstName: '',
        lastName: '',
        dialCoode: '',
        phone: '',
        email: '',
        tosAgreement: true,
        referred: [],
        address: '',
        zipCode: '',
        city: '',
        country: '',
        dob: '',
        avatarUrl: '',
        confirmed: {
          email: true,
          phone: false
        },
        social: {
          facebook: profile.id,
          twitter: '',
          google: '',
          linkedin: ''
        },
        registeredAt: now,
        updatedAt: now,
        role: 'user'
      }

      await createUser(u, (err) => {
        if (!err) {
          done(200, { status: t('ok') })
        } else {
          done(500, { error: err })
        }
      })
    })
    userData.social.facebook = profile.id
    // update existing user
  }))
}

const twitter = async (data, done) => {
  passport.use(new TwitterStrategy({
    consumerKey: socialConfig.twitter.consumerKey,
    consumerSecret: socialConfig.twitter.consumerSecret,
    callbackURL: socialConfig.twitter.callbackURL }, async (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    const userData = await read('users', profile.email).catch(async () => {
      const now = Date.now()
      const u = {
        profile,
        firstName: '',
        lastName: '',
        dialCoode: '',
        phone: '',
        email: '',
        tosAgreement: true,
        referred: [],
        address: '',
        zipCode: '',
        city: '',
        country: '',
        dob: '',
        avatarUrl: '',
        confirmed: {
          email: true,
          phone: false
        },
        social: {
          facebook: '',
          twitter: profile.id,
          google: '',
          linkedin: ''
        },
        registeredAt: now,
        updatedAt: now,
        role: 'user'
      }

      await createUser(u, (err) => {
        if (!err) {
          done(200, { status: t('ok') })
        } else {
          done(500, { error: err })
        }
      })
    })
    userData.social.twitter = profile.id
    // update existing user
  }))
}

const google = async (data, done) => {
  passport.use(new GoogleStrategy({
    clientID: socialConfig.google.clientID,
    clientSecret: socialConfig.google.clientSecret,
    callbackURL: socialConfig.google.callbackURL }, async (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    const userData = await read('users', profile.email).catch(async () => {
      const now = Date.now()
      const u = {
        profile,
        firstName: '',
        lastName: '',
        dialCoode: '',
        phone: '',
        email: '',
        tosAgreement: true,
        referred: [],
        address: '',
        zipCode: '',
        city: '',
        country: '',
        dob: '',
        avatarUrl: '',
        confirmed: {
          email: true,
          phone: false
        },
        social: {
          facebook: '',
          twitter: '',
          google: profile.id,
          linkedin: ''
        },
        registeredAt: now,
        updatedAt: now,
        role: 'user'
      }

      await createUser(u, (err) => {
        if (!err) {
          done(200, { status: t('ok') })
        } else {
          done(500, { error: err })
        }
      })
    })
    userData.social.google = profile.id
    // update existing user
  }))
}

export const createSocial = async (data, done) => {
  const valid = await socialSchema.isValid(data.payload)
  if (valid) {
    const provider = data.payload.provider
    switch (provider) {
      case 'facebook':
        await facebook(data, (status, data) => done(status, data))
        break
      case 'twitter':
        await twitter(data, (status, data) => done(status, data))
        break
      case 'google':
        await google(data, (status, data) => done(status, data))
        break
      default:
        console.log()
    }
  } else {
    done(400, { error: t('error_required') })
  }
}

export const setRole = async (data, done) => {
  const valid = await setRoleSchema.isValid(data.payload)
  if (valid) {
    const tokenData = await read('tokens', data.payload.tokenId).catch(() => done(403, { error: t('unauthorized') }))
    if (tokenData && tokenData.role === 'admin') {
      let userData = await read('users', tokenData.email).catch(() => done(403, { error: t('error_no_user') }))
      userData.role = data.payload.role
      await update('users', tokenData.email, userData).catch(() => done(403, { error: t('error_cannot_update') }))
      done(200, { status: t('ok') })
    } else {
      done(403, { error: t('unauthorized') })
    }
  } else {
    done(400, { error: t('error_required') })
  }
}
