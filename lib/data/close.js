import { close } from 'fs'

export default (descriptor, done) => {
  close(descriptor, (err) => {
    if (!err) {
      done(false)
    } else {
      done(`Error closing file: ${err.message}`)
    }
  })
}
