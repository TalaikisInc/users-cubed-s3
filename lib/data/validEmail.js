import { promisify } from 'util'

import legit from 'legit'

const validEmail = (email, done) => {
  legit(email).then((res) => {
    if (!res.isValid) {
      done(false)
    } else {
      done(email)
    }
  })
}

export default validEmail

export const validEmailAsync = promisify(validEmail)
