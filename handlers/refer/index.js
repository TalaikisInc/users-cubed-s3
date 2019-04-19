import { validate } from 'isemail'

import tokenHeader from '../../lib/data/tokenHeader'
import config from '../../config'
import dataLib from '../../lib/data/functions'
import userObj from '../../lib/data/userObj'
import finalizeRequest from '../../lib/data/finalizeRequest'
import sendEmail from '../../lib/email'
import uuidv4 from '../../lib/security/uuidv4'

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
  const msg = `Click the following link: <a href="${config.baseUrl}?token=${token}">${token}</a>`

  sendEmail(email, subject, msg, (err) => {
    if (!err.error) {
      done(false)
    } else {
      done(err.error)
    }
  })
}

/**
  * @desc Referring user sends email to friend
  * @param object data - { headers: ( token: 'Bearer ...' ), phone: ..., to: ... }
  * @return bool - success or failure with optional error object
*/
export const refer = (data, done) => {
  tokenHeader(data, (authToken) => {
    if (authToken) {
      userObj(data, (u) => {
        if (u) {
          const refEmail = typeof data.payload.to === 'string' && data.payload.to.indexOf('@') > -1 ? data.payload.to.trim() : false
          if (u.email && refEmail) {
            dataLib.read('users', u.email, (err, userData) => {
              if (!err && data) {
                generateToken(u.email, (err, refToken) => {
                  if (!err) {
                    userData.referred.push(refToken)
                    userData.updatedAt = Date.now()
      
                    const referringUser = `${userData.firstName} ${userData.lastName} <${userData.email}>`
                    sendReferEmail(refEmail, refToken, referringUser, (err) => {
                      if (!err) {
                        finalizeRequest('users', u.phone, 'update', done, userData)
                      } else {
                        done(400, { error: `Cannot send referral email: ${err}` })
                      }
                    })
                  } else {
                    done(400, { error: `Cannot generate token: ${refToken}` })
                  }
                })
              } else {
                done(400, { error: 'No such user.' })
              }
            })
          } else {
            done(400, { error: 'Not all data is provided.' })
          }
        } else {
          done(400, { error: 'No date provided.' })
        }
      })
    } else {
      done(403, { error: 'Wrong token provided.' })
    }
  })
}

/**
  * @desc Referred user clicks his link
  * @param object data - { token: .... }
  * @return bool - success or failure with optional error object
*/
export const use = (data, done) => {
  const token = typeof data.payload.token === 'string' && data.payload.token.length === 36 ? data.payload.token : false
  if (token) {
    dataLib.read('refers', token, (err, refData) => {
      if (!err && refData) {
        refData.used = true
        finalizeRequest('refers', token, 'update', done, refData)
      } else {
        done(403, { error: 'No such referral token.' })
      }
    })
  } else {
    done(400, { error: 'Wrong data provided.' })
  }
}

/**
  * @desc After referred user registration we update refer object
  * @param object data - { token: ...., phone: ... }
  * @return bool - success or failure with optional error object
*/
export const register = (data, done) => {
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
                  done(500, { error: 'Cannot update user.' })
                }
              })
            } else {
              done(400, { error: 'Referred user already registered.' })
            }
          } else {
            done(400, { error: 'Cannot find referral token.' })
          }
        })
      } else {
        done(400, { error: 'No such user' })
      }
    })
  } else {
    done(400, { error: 'Wrong data provided.' })
  }
}
