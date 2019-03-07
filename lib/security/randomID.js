import { randomBytes } from 'crypto'

export default (n, done) => {
  randomBytes(n, (err, buf) => {
    if (err) {
      done(false)
    } else {
      done(buf.toString('hex'))
    }
  })
}
