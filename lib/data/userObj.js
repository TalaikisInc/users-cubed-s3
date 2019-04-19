import { validate } from 'isemail'

import loose from './loose';

export default (data, done) => {
  if (data.payload) {
    const email = validate(data.payload.email)

    if (email) {
      loose(data, (out) => {
        done(out)
      })
    } else {
      done(false)
    }
  } else {
    done(false)
  }
}
