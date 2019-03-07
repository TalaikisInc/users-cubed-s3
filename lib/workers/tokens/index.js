import dataLib from '../../data/functions'
import log from '../../debug/log'
import error from '../../debug/error'
import config from '../../../config'

const tokenWorker = {}

tokenWorker.check = (data) => {
  const token = typeof data.tokenId === 'string' && data.tokenId.length === 64 ? data.tokenId : false
  if (token) {
    if (data.expiry < Date.now()) {
      dataLib.delete('tokens', token, (err) => {
        if (!err) {
          log('Token deleted.', 'FgGreen')
        } else {
          error(`Error deleting: ${err}`)
        }
      })
    }
  }
}

tokenWorker.tokens = () => {
  dataLib.list('tokens', (err, data) => {
    if (!err && data.length > 0) {
      data.forEach((el) => {
        dataLib.read('tokens', el, (er, elData) => {
          if (!er && elData) {
            tokenWorker.check(elData)
          } else {
            error(`Error reading: ${el}`)
          }
        })
      })
    } else {
      error(`Error reading directory or empty: ${err}`)
    }
  })
}

tokenWorker.loop = () => {
  setInterval(() => {
    tokenWorker.tokens()
  }, 1000 * config.workers.tokenClean)
}

export default tokenWorker
