import error from '../../lib/debug/error'
import config from '../../config'
import dataLib from '../../lib/data/functions'
import finalizeRequest from '../../lib/data/finalizeRequest'
import hash from '../../lib/security/hash'
import randomID from '../../lib/security/randomID'
import sendEmail from '../../lib/email'
import { t, setLocale } from '../../lib/translations'
import { confirmSchema } from './schema'

const token = (data, done) => {
  if (typeof data.payload === 'object') {
    done(typeof data.payload.token === 'string' && data.payload.token.trim().length === 64 ? data.payload.token.trim() : false)
  } else {
    done(false)
  }
}

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

const selectType = (tokenData, userData, done) => {
  if (tokenData.type === 'reset') {
    randomID(16, (password) => {
      if (password) {
        hash(password, (hashed) => {
          if (!hashed) {
            done(500, { error: t('error_hash') })
          } else {
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
          }
        })
      } else {
        done(500, { error: t('error_generate') })
      }
    })
  } else if (tokenData.type === 'email' || tokenData.type === 'phone') {
    userData.confirmed[tokenData.type] = true
    finalizeRequest('users', tokenData.email, 'update', done, userData)
  }
}

const _confirm = (id, done) => {
  dataLib.read('confirms', id, (err, tokenData) => {
    if (!err && tokenData) {
      if (tokenData.expiry > Date.now()) {
        if (tokenData.token === id) {
          dataLib.read('users', tokenData.email, (err, userData) => {
            if (!err && userData) {
              selectType(tokenData, userData, (status, data) => {
                done(status, data)
              })
            } else {
              done(400, { error: t('error_no_user') })
            }
          })
        } else {
          done(403, { error: t('error_token_invalid') })
        }
      } else {
        done(403, { error: t('error_token_expired') })
      }
    } else {
      done(403, { error: t('error_token_notfound') })
    }
  })
}

export default async (data, done) => {
  const valid = await confirmSchema.isValid(data.payload)
  if (valid) {
    setLocale(data, () => {
      token(data, (id) => {
        if (id) {
          _confirm(id, (status, data) => {
            done(status, data)
          })
        } else {
          done(400, { error: t('error_required') })
        }
      })
    })
  } else {
    done(400, { error: t('error_required') })
  }
}
