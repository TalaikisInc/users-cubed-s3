import { validate } from 'isemail'

import tokenHeader from '../data/tokenHeader'
import dataLib from '../data/functions'

export default (data, done) => {
  const token = tokenHeader(data)

  if (token && validate(data.payload.email)) {
    dataLib.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        if (tokenData.expiry > Date.now()) {
          done(tokenData)
        } else {
          done(false)
        }
      } else {
        done(false)
      }
    })
  } else {
    done(false)
  }
}
