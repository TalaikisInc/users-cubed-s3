import { validate } from 'isemail'

import dataLib from '../../data/functions'
import log from '../../debug/log'
import error from '../../debug/error'
import config from '../../../config'

const unconfirmedWorker = {}

unconfirmedWorker.check = (data) => {
  const id = typeof data.token === 'string' && data.token.length === 64 ? data.token : false

  if (id && validate(data.email)) {
    if (data.expiry < Date.now()) {
      dataLib.delete('confirms', id, (err) => {
        if (!err) {
          dataLib.read('users', data.email, (err, data) => {
            if (!err && data) {
              if ((!data.confirmed.email && config.mainConfirm === 'email') || (!data.confirmed.phone && config.mainConfirm === 'phone')) {
                dataLib.delete('users', data.email, (err) => {
                  if (!err) {
                    log('User deleted.', 'FgGreen')
                  } else {
                    error(`Error deleting user: ${err}`)
                  }
                })
              }
            } else {
              error(`Error getting user: ${err}`)
            }
          })
        } else {
          error(`Error deleting token: ${err}`)
        }
      })
    }
  }
}

unconfirmedWorker.cleaner = () => {
  dataLib.list('confirms', (err, data) => {
    if (!err && data.length > 0) {
      data.forEach((el) => {
        dataLib.read('tokens', el, (er, elData) => {
          if (!er && elData) {
            unconfirmedWorker.check(elData)
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

unconfirmedWorker.loop = () => {
  setInterval(() => {
    unconfirmedWorker.cleaner()
  }, 1000 * config.workers.unconfirmedClean)
}

export default unconfirmedWorker
