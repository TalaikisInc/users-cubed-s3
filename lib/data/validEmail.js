import legit from 'legit'
import { validate } from 'isemail'

export default (email, done) => {
  if (validate(email)) {
    legit(email).then((res) => {
      if (!res.isValid) {
        done(false)
      } else {
        done(data.payload.email)
      }
    })
  } else {
    done(false)
  }
}
