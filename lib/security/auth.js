import tokenHeader from '../data/tokenHeader'
import dataLib from '../data/functions'

export default (data, done) => {
  tokenHeader(data, (token) => {
    if (token) {
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
  })
}
