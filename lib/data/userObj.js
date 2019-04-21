import { promisify } from 'util'

import loose from './loose'
import validEmail from './validEmail'

const userObj = (data, done) => {
  if (data.payload) {
    validEmail(data.payload.email, (email) => {
      if (email) {
        loose(data, email, (_, out) => {
          out['email'] = email
          done(false, out)
        })
      } else {
        done('Invalid email.')
      }
    })
  } else {
    done('No payload.')
  }
}

export const user = promisify(userObj)

export default userObj
