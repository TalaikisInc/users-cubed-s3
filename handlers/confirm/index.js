import error from '../../lib/debug/error'
import config from '../../config'
import { read } from '../../lib/data/functions'
import finalizeRequest from '../../lib/data/finalizeRequest'
import { hashAsync } from '../../lib/security/hash'
import { randomIDAsync } from '../../lib/security/randomID'
import sendEmail from '../../lib/email'
import { t, setLocaleAsync } from '../../lib/translations'
import { confirmSchema } from './schema'

const sendNewPassword = (email, password, done) => {
  const subject = `${t('email_password')} ${config.company}`
  const msg = `${t('email_password')} <a href='${config.baseUrl}'>${config.company}</a>:
    <h4>${password}</h4>`
  sendEmail(email, subject, msg, (err) => {
    if (!err.error) {
      done(false)
    } else {
      done(err)
    }
  })
}

const selectType = async (tokenData, userData, done) => {
  if (tokenData.type === 'reset') {
    const password = await randomIDAsync(16).catch(() => done(500, { error: t('error_generate') }))
    const hashed = await hashAsync(password).catch(() => done(500, { error: t('error_hash') }))
    userData.password = hashed
    userData.updatedAt = Date.now()
    sendNewPassword(userData.email, password, (err) => {
      if (!err) {
        finalizeRequest('users', tokenData.email, 'update', done, userData)
      } else {
        finalizeRequest('users', tokenData.email, 'update', done, userData)
        error(err)
      }
    })
  } else if (tokenData.type === 'email' || tokenData.type === 'phone') {
    userData.confirmed[tokenData.type] = true
    finalizeRequest('users', tokenData.email, 'update', done, userData)
  }
}

const _confirm = async (id, done) => {
  const tokenData = await read('confirms', id).catch(() => done(403, { error: t('error_token_notfound') }))
  if (tokenData.expiry > Date.now()) {
    if (tokenData.token === id) {
      const userData = await read('users', tokenData.email).catch(() => done(400, { error: t('error_no_user') }))
      await selectType(tokenData, userData, (status, data) => {
        done(status, data)
      })
    } else {
      done(403, { error: t('error_token_invalid') })
    }
  } else {
    done(403, { error: t('error_token_expired') })
  }
}

export default async (data, done) => {
  const valid = await confirmSchema.isValid(data.payload)
  if (valid) {
    await setLocaleAsync(data)
    await _confirm(data.payload.token, (status, data) => {
      done(status, data)
    })
  } else {
    done(400, { error: t('error_required') })
  }
}
