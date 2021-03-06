import { tokenHeaderAsync } from '../../lib/data/tokenHeader'
import config from '../../config'
import { create, read, update } from '../../lib/data/functions'
import { user } from '../../lib/data/userObj'
import finalizeRequest from '../../lib/data/finalizeRequest'
import sendEmail from '../../lib/email'
import uuidv4 from '../../lib/security/uuidv4'
import { t, setLocaleAsync } from '../../lib/translations'
import { referSchema, useSchema, registerSchema } from './schema'
import { validate } from 'isemail'

const generateToken = async (email, done) => {
  const token = uuidv4()
  const obj = {
    id: token,
    referral: email,
    used: false,
    finalized: false
  }

  await create('refers', token, obj).catch(() => done(true, t('error_save')))
  done(false, token)
}

const sendReferEmail = (email, token, referringUser, done) => {
  const subject = `${referringUser} is inviting you to join ${config.company}`
  const msg = t('refer_email', { baseUrl: config.baseUrl, token: token })

  sendEmail(email, subject, msg, (err) => {
    if (!err) {
      done(false)
    } else {
      done(err)
    }
  })
}

const _generateToken = (tokenData, userData, refEmail, done) => {
  generateToken(tokenData.email, (err, refToken) => {
    if (!err) {
      userData.referred.push(refToken)
      userData.updatedAt = Date.now()

      const referringUser = `${userData.firstName} ${userData.lastName} <${tokenData.email}>`
      sendReferEmail(refEmail, refToken, referringUser, (err) => {
        if (!err) {
          finalizeRequest('users', tokenData.email, 'update', done, userData)
        } else {
          done(400, { error: t('error_refer_email') })
        }
      })
    } else {
      done(400, { error: t('error_id') })
    }
  })
}

/**
  * @desc Referring user sends email to friend
  * @param object data - { headers: ( token: 'Bearer ...' ), phone: ..., to: ... }
  * @return bool - success or failure with optional error object
*/
export const refer = async (data, done) => {
  const valid = await referSchema.isValid(data.payload)
  if (valid) {
    await setLocaleAsync(data)
    const token = await tokenHeaderAsync(data).catch(() => done(403, { error: t('error_wrong_token') }))
    const tokenData = await read('tokens', token).catch(() => done(403, { error: t('error_cannot_read') }))
    const validRef = validate(data.payload.to)
    if (tokenData.email && validRef && data.payload.to !== tokenData.email) {
      const userData = await read('users', tokenData.email).catch(() => done(400, { error: t('error_cannot_read') }))
      if (userData) {
        _generateToken(tokenData, userData, data.payload.to, (status, data) => {
          done(status, data)
        })
      } else {
        done(400, { error: t('error_no_user') })
      }
    } else {
      done(400, { error: t('error_required') })
    }
  } else {
    done(400, { error: t('error_required') })
  }
}

/**
  * @desc Referred user clicks his link
  * @param object data - { token: .... }
  * @return bool - success or failure with optional error object
*/
export const use = async (data, done) => {
  const valid = await useSchema.isValid(data.payload)
  if (valid) {
    await setLocaleAsync(data)
    const token = typeof data.payload.token === 'string' && data.payload.token.length === 36 ? data.payload.token : false
    if (token) {
      let refData = await read('refers', token).catch(() => done(403, { error: t('error_token_notfound') }))
      refData.used = true
      finalizeRequest('refers', token, 'update', done, refData)
    } else {
      done(400, { error: t('error_required') })
    }
  } else {
    done(400, { error: t('error_required') })
  }
}

/**
  * @desc After referred user registration we update refer object
  * @param object data - { token: ...., phone: ... }
  * @return bool - success or failure with optional error object
*/
export const register = async (data, done) => {
  const valid = await registerSchema.isValid(data.payload)
  if (valid) {
    await setLocaleAsync(data)
    const token = typeof data.payload.token === 'string' && data.payload.token.length === 36 ? data.payload.token : false
    const email = data.payload.from
    if (token && email) {
      const userData = await read('users', email).catch(() => done(400, { error: t('error_no_user') }))
      const tokenData = await read('refers', token).catch(() => done(400, { error: t('error_token_notfound') }))
      if (!userData.referred.includes(token)) {
        userData.referred.push(token)
        userData.updatedAt = Date.now()
        await update('users', email, userData).catch(() => done(500, { error: t('error_cannot_update') }))
        tokenData.finalized = true
        finalizeRequest('refers', token, 'update', done, tokenData)
      }
    } else {
      done(400, { error: t('error_required') })
    }
  }
}