import { promisify } from 'util'

import randomID from '../../lib/security/randomID'
import config from '../../config'
import dataLib from '../../lib/data/functions'
import userObj from '../../lib/data/userObj'
import hash from '../../lib/security/hash'
import finalizeRequest from '../../lib/data/finalizeRequest'
import schema from './schema'
import { t, setLocale } from '../../lib/translations'

const valid = (data, done) => {
  done(typeof data.payload.tokenId === 'string' && data.payload.tokenId.trim().length === 64 ? data.payload.tokenId.trim() : false)
}

export const get = async (data, done) => {
  setLocale(data, () => {
    data(data, (id) => {
      if (id) {
        dataLib.read('tokens', data.payload.tokenId, (err, tokenData) => {
          if (!err && tokenData) {
            done(200, tokenData)
          } else {
            done(404, { error: t('error_no_user') })
          }
        })
      } else {
        done(400, { error: t('error_required') })
      }
    })
  })
}

const _hash = (u, userData, done) => {
  hash(u.password, (hashed) => {
    if (userData.password === hashed) {
      randomID(32, (tokenId) => {
        if (tokenId) {
          const expiry = Date.now() + 1000 * config.tokenExpiry
          const tokenObj = {
            expiry,
            tokenId,
            role: userData.role,
            email: u.email
          }

          dataLib.create('tokens', tokenId, tokenObj, (err, res) => {
            if (!err) {
              done(200, { token: tokenId })
            } else {
              done(500, { error: t('error_token') })
            }
          })
        } else {
          done(400, { error: t('error_id') })
        }
      })
    } else {
      done(401, { error: t('error_invalid_password') })
    }
  })
}

const read = promisify(dataLib.read)
const hashAsync = promisify(_hash)
const obj = promisify(userObj)
const locale = promisify(setLocale)

export const create = async (data, done) => {
  locale(data)
    .then(() => schema.isValid(data.payload))
    .then((valid) => obj(data))
    .then((u) => read('users', u.email))
    .then((u, userData) => hashAsync(u, userData))
}

/*
export const create = async (data, done) => {
  setLocale(data, () => {
    schema.isValid(data.payload).then((valid) => {
      if (valid) {
        userObj(data, (u) => {
          if (u) {
            if ((u.email && u.password) || (u.phone && u.password)) {
              dataLib.read('users', u.email, (err, userData) => {
                if (!err && userData) {
                  if (userData.confirmed.email || userData.confirmed.phone) {
                    _hash(u, userData, (status, out) => {
                      done(status, out)
                    })
                  } else {
                    done(400, { error: t('error_confirmed') })
                  }
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
        done(400, { error: t('error_required') })
      }
    })
  })
}
*/

export const extend = async (data, done) => {
  setLocale(data, () => {
    valid(data, (id) => {
      if (id) {
        dataLib.read('tokens', id, (err, tokenData) => {
          if (!err && tokenData) {
            if (tokenData.expiry > Date.now()) {
              tokenData.expiry = Date.now() + 1000 * config.tokenExpiry
              finalizeRequest('tokens', id, 'update', done, tokenData)
            } else {
              done(400, { error: t('error_token_expired') })
            }
          } else {
            done(400, { error: t('error_token_notfound') })
          }
        })
      } else {
        done(400, { error: t('error_required') })
      }
    })
  })
}

export const destroy = async (data, done) => {
  setLocale(data, () => {
    valid(data, (token) => {
      if (token) {
        dataLib.read('tokens', token, (err, data) => {
          if (!err && data) {
            finalizeRequest('tokens', token, 'delete', done)
          } else {
            done(404, { error: t('error_token_notfound') })
          }
        })
      } else {
        done(400, { error: t('error_required') })
      }
    })
  })
}

export const createSocial = (data, done) => {
  const oauth = typeof data.payload.oauth === 'string' ? data.payload.oauth : false
  const provider = typeof data.payload.provider === 'string' && providers.includes(data.payload.provider) ? data.payload.provider : false
}
