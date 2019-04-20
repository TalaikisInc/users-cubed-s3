import { promisify } from 'util'

import loose from './loose'
import validEmail from './validEmail'

const userObj = (data, done) => {
  if (data.payload) {
    validEmail(data.payload.email, (email) => {
      if (email) {
        loose(data, email, (out) => {
          out['email'] = email
          done(out)
        })
      } else {
        done(false)
      }
    })
  } else {
    done(false)
  }
}

export const user = promisify(userObj)

export default userObj
