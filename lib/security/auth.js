import { promisify } from 'util'

import tokenHeader from '../data/tokenHeader'
import dataLib from '../data/functions'

const auth = (data, done) => {
  tokenHeader(data, (err, token) => {
    if (!err && token) {
      dataLib.read('tokens', token, (err, tokenData) => {
        if (!err && tokenData) {
          if (tokenData.expiry > Date.now()) {
            done(false, tokenData)
          } else {
            done('Token expired.')
          }
        } else {
          done('No such token.')
        }
      })
    } else {
      done('Unauthorized.')
    }
  })
}

export default auth

export const authAsync = promisify(auth)
