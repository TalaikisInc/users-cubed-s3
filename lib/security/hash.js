import { createHmac } from 'crypto'
import { promisify } from 'util'

import config from '../../config'

const hash = (msg, done) => {
  if (typeof msg === 'string' && msg.length > 0) {
    done(false, createHmac('sha256', config.hashingSecret).update(msg).digest('hex'))
  } else {
    done('Error hashing')
  }
}

export default hash

export const hashAsync = promisify(hash)
