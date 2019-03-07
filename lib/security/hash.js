import { createHmac } from 'crypto'

import config from '../../config'

export default (msg, done) => {
  if (typeof msg === 'string' && msg.length > 0) {
    done(createHmac('sha256', config.hashingSecret).update(msg).digest('hex'))
  } else {
    done(false)
  }
}
