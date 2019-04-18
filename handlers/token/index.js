import { Validator } from 'jsonschema'

import randomID from '../../lib/security/randomID'
import config from '../../config'
import dataLib from '../../lib/data/functions'
import userObj from '../../lib/data/userObj'
import hash from '../../lib/security/hash'
import finalizeRequest from '../../lib/data/finalizeRequest'
import { createSchema } from './schema'
const v = new Validator()

const valid = (data) => {
  return typeof data.payload.tokenId === 'string' && data.payload.tokenId.trim().length === 64 ? data.payload.tokenId.trim() : false
}

export const get = (data, done) => {
  if (valid(data)) {
    dataLib.read('tokens', data.payload.tokenId, (err, tokenData) => {
      if (!err && tokenData) {
        done(200, tokenData)
      } else {
        done(404, { error: `No such user, error: ${err.message}` })
      }
    })
  } else {
    done(400, { error: 'Missing required field.' })
  }
}

export const create = (data, done) => {
  console.log('v.validate(data, createSchema)')
  console.log(v.validate(data, createSchema))
  const u = userObj(data)

  if ((u.email && u.password) || (u.phone && u.password)) {
    dataLib.read('users', u.email, (err, userData) => {
      if (!err && userData) {
        if (userData.confirmed.email || userData.confirmed.phone) {
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
                      done(500, { error: 'Could not create token.' })
                    }
                  })
                } else {
                  done(400, { error: 'Cannot get unique ID.' })
                }
              })
            } else {
              done(401, { error: 'Invalid password.' })
            }
          })
        } else {
          done(400, { error: 'User\'s account is not confirmed.' })
        }
      } else {
        done(400, { error: 'Cannot find specified user.' })
      }
    })
  } else {
    done(400, { error: 'Missing required fields.' })
  }
}

export const extend = (data, done) => {
  const id = valid(data)
  if (id) {
    dataLib.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        if (tokenData.expiry > Date.now()) {
          tokenData.expiry = Date.now() + 1000 * config.tokenExpiry
          finalizeRequest('tokens', id, 'update', done, tokenData)
        } else {
          done(400, { error: 'Token is expired, please login again.' })
        }
      } else {
        done(400, { error: 'Token doesn\'t exist.' })
      }
    })
  } else {
    done(400, { error: 'Missing required fields or invalid.' })
  }
}

export const destroy = (data, done) => {
  const token = valid(data)
  if (token) {
    dataLib.read('tokens', token, (err, data) => {
      if (!err && data) {
        finalizeRequest('tokens', token, 'delete', done)
      } else {
        done(404, { error: 'No such token.' })
      }
    })
  } else {
    done(400, { error: 'Missing required field.' })
  }
}
