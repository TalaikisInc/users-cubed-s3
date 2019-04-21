import { randomBytes } from 'crypto'
import { promisify } from 'util'

const randomID = (n, done) => {
  randomBytes(n, (err, buf) => {
    if (err) {
      done('Error generating bytes.')
    } else {
      done(false, buf.toString('hex'))
    }
  })
}

export default randomID

export const randomIDAsync = promisify(randomID)
