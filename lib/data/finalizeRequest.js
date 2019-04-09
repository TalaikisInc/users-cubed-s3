import dataLib from './functions'
import t from '../translations'

export default (collection, id, action, done, obj) => {
  if (typeof obj === 'object') {
    dataLib[action](collection, id, obj, (err, data) => {
      if (!err) {
        done(200, { status: t('ok') })
      } else {
        done(500, { error: `Could not ${action} from ${collection}.` })
      }
    })
  } else {
    dataLib[action](collection, id, (err, data) => {
      if (!err) {
        done(200, { status: t('ok') })
      } else {
        done(500, { error: `Could not ${action} from ${collection}.` })
      }
    })
  }
}
