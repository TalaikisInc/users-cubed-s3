import { validate } from 'isemail'

import tokenHeader from '../../lib/data/tokenHeader'
import config from '../../config'
import dataLib from '../../lib/data/functions'
import userObj from '../../lib/data/userObj'
import finalizeRequest from '../../lib/data/finalizeRequest'
import sendEmail from '../../lib/email'
import uuidv4 from '../../lib/security/uuidv4'
import { t, setLocale } from '../../lib/translations'

const generateToken = (email, done) => {
  const token = uuidv4()
  const obj = {
    id: token,
    referral: email,
    used: false,
    finalized: false
  }

  dataLib.create('refers', token, obj, (err) => {
    if (!err) {
      done(false, token)
    } else {
      done(true, err)
    }
  })
}

const sendReferEmail = (email, token, referringUser, done) => {
  const subject = `${referringUser} is inviting you to join ${config.company}`
  const msg = t('refer_email', { baseUrl: config.baseUrl, token: token })

  sendEmail(email, subject, msg, (err) => {
    if (!err.error) {
      done(false)
    } else {
      done(err.error)
    }
  })
}

const _generateToken = (u, userData, refEmail, done) => {
  generateToken(u.email, (err, refToken) => {
    if (!err) {
      userData.referred.push(refToken)
      userData.updatedAt = Date.now()

      const referringUser = `${userData.firstName} ${userData.lastName} <${userData.email}>`
      sendReferEmail(refEmail, refToken, referringUser, (err) => {
        if (!err) {
          finalizeRequest('users', u.phone, 'update', done, userData)
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
  setLocale(data, () => {
    tokenHeader(data, (authToken) => {
      if (authToken) {
        userObj(data, (u) => {
          if (u) {
            const refEmail = typeof data.payload.to === 'string' && data.payload.to.indexOf('@') > -1 ? data.payload.to.trim() : false
            if (u.email && refEmail) {
              dataLib.read('users', u.email, (err, userData) => {
                if (!err && data) {
                  _generateToken(u, userData, refEmail, (status, data) => {
                    done(status, data)
                  })
                } else {
                  done(400, { error: t('error_no_user') })
                }
              })
            } else {
              done(400, { error: t('error_required') })
            }
          } else {
            done(400, { error: t('error_required') })
          }
        })
      } else {
        done(403, { error: t('error_wrong_token') })
      }
    })
  })
}

/**
  * @desc Referred user clicks his link
  * @param object data - { token: .... }
  * @return bool - success or failure with optional error object
*/
export const use = async (data, done) => {
  setLocale(data, () => {
    const token = typeof data.payload.token === 'string' && data.payload.token.length === 36 ? data.payload.token : false
    if (token) {
      dataLib.read('refers', token, (err, refData) => {
        if (!err && refData) {
          refData.used = true
          finalizeRequest('refers', token, 'update', done, refData)
        } else {
          done(403, { error: t('error_token_notfound') })
        }
      })
    } else {
      done(400, { error: t('error_required') })
    }
  })
}

/**
  * @desc After referred user registration we update refer object
  * @param object data - { token: ...., phone: ... }
  * @return bool - success or failure with optional error object
*/
export const register = async (data, done) => {
  setLocale(data, () => {
    const token = typeof data.payload.token === 'string' && data.payload.token.length === 36 ? data.payload.token : false
    const email = typeof data.payload.from === 'string' && validate(data.payload.from) ? data.payload.from : false
    if (token && email) {
      dataLib.read('users', email, (err, userData) => {
        if (!err && userData) {
          dataLib.read('refers', token, (err, tokenData) => {
            if (!err && tokenData) {
              if (!userData.referred.includes(token)) {
                userData.referred.push(token)
                userData.updatedAt = Date.now()
                dataLib.update('users', email, userData, (err) => {
                  if (!err) {
                    tokenData.finalized = true
                    finalizeRequest('refers', token, 'update', done, tokenData)
                  } else {
                    done(500, { error: t('error_cannot_update') })
                  }
                })
              } else {
                done(400, { error: t('error_ref_reg') })
              }
            } else {
              done(400, { error: t('error_token_notfound') })
            }
          })
        } else {
          done(400, { error: t('error_no_user') })
        }
      })
    } else {
      done(400, { error: t('error_required') })
    }
  })
}
