import randomID from '../../lib/security/randomID'
import config from '../../config'
import dataLib, { read } from '../../lib/data/functions'
import userObj from '../../lib/data/userObj'
import hash from '../../lib/security/hash'
import finalizeRequest from '../../lib/data/finalizeRequest'
import { tokenCreate, tokenGet, tokenExtend, tokenDestroy } from './schema'
import { t, setLocale } from '../../lib/translations'

export const get = async (data, done) => {
  const valid = await tokenGet.isValid(data.payload)
  if (valid) {
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
  } else {
    done(400, { error: t('error_required') })
  }
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

export const create = async (data, done) => {
  const valid = tokenCreate.isValid(data.payload)
  if (valid) {
    setLocale(data, () => {
      userObj(data, async (u) => {
        if (u) {
          if ((u.email && u.password) || (u.phone && u.password)) {
            const userData = await read('users', u.email).catch((e) => {
              done(400, { error: t('error_no_user') })
            })

            if (userData.confirmed.email || userData.confirmed.phone) {
              _hash(u, userData, (status, out) => {
                done(status, out)
              })
            } else {
              done(400, { error: t('error_confirmed') })
            }
          } else {
            done(400, { error: t('error_required') })
          }
        } else {
          done(400, { error: t('error_required') })
        }
      })
    })
  } else {
    done(400, { error: t('error_required') })
  }
}

export const extend = async (data, done) => {
  const valid = await tokenExtend.isValid(data.payload)
  if (valid) {
    setLocale(data, () => {
      const id = data.payload.tokenId
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
  } else {
    done(400, { error: t('error_required') })
  }
}

export const destroy = async (data, done) => {
  const valid = await tokenDestroy.isValid(data.payload)
  if (valid) {
    setLocale(data, () => {
      const token = data.payload.tokenId
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
  } else {
    done(400, { error: t('error_required') })
  }
}
