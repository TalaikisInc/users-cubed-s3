import passport from 'passport'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as TwitterStrategy } from 'passport-twitter'
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'

import socialConfig from './socialConfig'
import joinDelete from '../../lib/data/joinDelete'
import dataLib from '../../lib/data/functions'
import userObj from '../../lib/data/userObj'
import loose from '../../lib/data/loose'
import validEmail from '../../lib/data/validEmail'
import hash from '../../lib/security/hash'
import config from '../../config'
import randomID from '../../lib/security/randomID'
import sendEmail from '../../lib/email'
import sendSMS from '../../lib/phone'
import log from '../../lib/debug/log'
import error from '../../lib/debug/error'
import auth from '../../lib/security/auth'
import { t, setLocale } from '../../lib/translations'

const sendEmailConfirmation = (email, done) => {
  randomID(32, (code) => {
    if (code) {
      const subject = t('account_confirm_subject', { company: config.company })
      const msg = t('account_confirm_message', { company: config.company, baseUrl: config.baseUrl, code: code })
      const obj = {
        email,
        token: code,
        type: config.mainConfirm,
        expiry: Date.now() + 1000 * 60 * 60
      }

      dataLib.create('confirms', code, obj, (err) => {
        if (!err) {
          sendEmail(email, subject, msg, (err) => {
            if (!err.error) {
              done(false)
            } else {
              done(err)
            }
          })
        } else {
          done(t('error_confirmation_save'))
        }
      })
    } else {
      done(t('error_confirmation_generate'))
    }
  })
}

const sendPhoneConfirmation = (phone, email, done) => {
  randomID(6, (code) => {
    if (code) {
      const msg = t('account_confirm_phone', { company: config.company, code: code })
      const obj = {
        email,
        token: code,
        expiry: Date.now() + 1000 * 60 * 60
      }

      dataLib.create('confirms', code, obj, (err) => {
        if (!err) {
          sendSMS(phone, msg, (err) => {
            if (!err.error) {
              done(false)
            } else {
              done(err)
            }
          })
        } else {
          done(t('error_confirmation_save'))
        }
      })
    } else {
      done(t('error_confirmation_generate'))
    }
  })
}

export const get = (data, done) => {
  auth(data, (tokenData) => {
    if (tokenData) {
      dataLib.read('users', tokenData.email, (err, userData) => {
        if (!err && userData) {
          delete userData.password
          done(200, userData)
        } else {
          done(404, { error: t('error_no_user') })
        }
      })
    } else {
      done(403, { error: t('unauthorized') })
    }
  })
}

const createUser = (obj, done) => {
  hash(obj.password, (hashedPassword) => {
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
        zipCode: obj.zipCodev,
        city: obj.city,
        country: obj.country,
        dob: obj.dob,
        avatarUrl: obj.avatarUrl,
        confirmed: {
          email: false,
          phone: false
        },
        registeredAt: now,
        updatedAt: now,
        role: 'user'
      }

      dataLib.create('users', obj.email, newObj, (err) => {
        if (!err) {
          if (config.mainConfirm === 'email') {
            sendEmailConfirmation(obj.email, (err) => {
              if (!err.error) {
                done(false)
              } else {
                done(t('error_email'))
              }
            })
          }

          if (config.mainConfirm === 'phone') {
            sendPhoneConfirmation(obj.phone, obj.email, (err) => {
              if (!err.error) {
                done(false)
              } else {
                done(t('error_sms'))
              }
            })
          }
        } else {
          done(t('error_user_create'))
        }
      })
    } else {
      done(t('error_hash'))
    }
  })
}

export const create = (data, done) => {
  setLocale(data, () => {
    userObj(data, (u) => {
      if (u) {
        if (u.email && u.password && u.tosAgreement) {
          dataLib.read('users', u.email, (err, _) => {
            if (err) {
              createUser(u, (err) => {
                if (!err) {
                  done(200, { status: t('ok') })
                } else {
                  done(500, { error: err })
                }
              })
            } else {
              done(400, { error: t('error_user_exists') })
            }
          })
        } else {
          done(400, { error: t('error_required') })
        }
      } else {
        done(400, { error: t('error_required') })
      }
    })
  })
}

const editFields = (u, userData, done) => {
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
    hash(u.password, (hashed) => {
      if (hashed) {
        userData.password = hashed
      } else {
        done(t('error_hash'))
      }
    })
  }
  done(false, userData)
}

const _update = (data, tokenData, done) => {
  loose(data, (u) => {
    if (u) {
      dataLib.read('users', tokenData.email, (err, userData) => {
        if (!err && userData) {
          if (userData.confirmed.email || userData.confirmed.phone) {
            editFields(u, userData, (err, newData) => {
              if (!err && newData) {
                dataLib.update('users', tokenData.email, newData, (err) => {
                  if (!err) {
                    dataLib.read('users', tokenData.email, (err, returnUuser) => {
                      if (!err && returnUuser) {
                        delete returnUuser.password
                        done(200, returnUuser)
                      } else {
                        done(500, { error: t('error_cannot_read') })
                      }
                    })
                  } else {
                    done(500, { error: t('error_cannot_update') })
                  }
                })
              } else {
                done(500, { error: t('error_unknown') })
              }
            })
          } else {
            done(400, { error: t('error_confirmed') })
          }
        } else {
          done(500, { error: t('error_cannot_read') })
        }
      })
    } else {
      done(400, { error: t('error_required') })
    }
  })
}

export const edit = (data, done) => {
  auth(data, (tokenData) => {
    if (tokenData) {
      _update(data, tokenData, (status, outData) => {
        done(status, outData)
      })
    } else {
      done(403, { error: t('unauthorized') })
    }
  })
}

export const destroy = (data, done) => {
  auth(data, (tokenData) => {
    if (tokenData) {
      dataLib.read('users', tokenData.email, (err, userData) => {
        if (!err && userData) {
          const refs = typeof userData.referred === 'object' && Array.isArray(userData.referred) ? userData.referred : []
          // delete any associated tables
          // const orders = typeof userData.orders === 'object' && Array.isArray(userData.orders) ? userData.orders : []
          dataLib.delete('users', tokenData.email, (err) => {
            if (!err) {
              joinDelete('refers', refs, (err) => {
                if (err) {
                  error(err)
                } else {
                  done(200, { status: t('ok') })
                }
              })
            } else {
              done(500, { error: t('error_user_delete') })
            }
          })
        } else {
          done(400, { error: t('error_no_user') })
        }
      })
    } else {
      done(403, { error: t('unauthorized') })
    }
  })
}

export const confirmPhone = () => {

}

export const createFacebook = (data, done) => {
  passport.use(new FacebookStrategy({
    clientID: socialConfig.facebook.clientID,
    clientSecret: socialConfig.facebook.clientSecret,
    callbackURL: socialConfig.facebook.callbackURL }, (accessToken, refreshToken, profile, done) => {
    dataLib.read('users', profile.id, (err, _) => {
      if (err) {
        const now = Date.now()
        // @TODO same providers fields into existing fields; if email exists create user under email
        const u = {
          provider: 'facebook',
          oauth: profile.id,
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
          registeredAt: now,
          updatedAt: now,
          role: 'user'
        }

        createUser(u, (err) => {
          if (!err) {
            done(200, { status: t('ok') })
          } else {
            done(500, { error: err })
          }
        })
      } else {
        done(400, { error: t('error_user_exists') })
      }
    })
  }))
}

export const createTwitter = (data, done) => {
  passport.use(new TwitterStrategy({
    consumerKey: socialConfig.twitter.consumerKey,
    consumerSecret: socialConfig.twitter.consumerSecret,
    callbackURL: socialConfig.twitter.callbackURL }, (accessToken, refreshToken, profile, done) => {
    dataLib.read('users', profile.id, (err, _) => {
      if (err) {
        const now = Date.now()
        // @TODO same providers fields into existing fields; if email exists create user under email
        const u = {
          provider: 'twitter',
          oauth: profile.id,
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
          registeredAt: now,
          updatedAt: now,
          role: 'user'
        }

        createUser(u, (err) => {
          if (!err) {
            done(200, { status: t('ok') })
          } else {
            done(500, { error: err })
          }
        })
      } else {
        done(400, { error: t('error_user_exists') })
      }
    })
  }))
}

export const createGoogle = (data, done) => {
  passport.use(new GoogleStrategy({
    clientID: socialConfig.google.clientID,
    clientSecret: socialConfig.google.clientSecret,
    callbackURL: socialConfig.google.callbackURL }, (accessToken, refreshToken, profile, done) => {
    dataLib.read('users', profile.id, (err, _) => {
      if (err) {
        const now = Date.now()
        // @TODO same providers fields into existing fields; if email exists create user under email
        const u = {
          provider: 'google',
          oauth: profile.id,
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
          registeredAt: now,
          updatedAt: now,
          role: 'user'
        }

        createUser(u, (err) => {
          if (!err) {
            done(200, { status: t('ok') })
          } else {
            done(500, { error: err })
          }
        })
      } else {
        done(400, { error: t('error_user_exists') })
      }
    })
  }))
}
