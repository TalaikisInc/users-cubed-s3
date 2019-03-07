import { writeFile } from 'fs'

import close from './close'

export default (descriptor, data, done) => {
  writeFile(descriptor, data, (err) => {
    if (!err) {
      close(descriptor, done)
    } else {
      done(`Error writing file: ${err.message}`)
    }
  })
}
