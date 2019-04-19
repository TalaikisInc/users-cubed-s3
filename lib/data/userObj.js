import loose from './loose'
import validEmail from './validEmail'

export default (data, done) => {
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
