import { randomBytes } from 'crypto'
import { promisify } from 'util'

const randomID = (n, done) => {
  randomBytes(n, (err, buf) => {
    if (err) {
      done(false)
    } else {
      done(buf.toString('hex'))
    }
  })
}

export default randomID

export const randomIdAsync = promisify(randomID)
