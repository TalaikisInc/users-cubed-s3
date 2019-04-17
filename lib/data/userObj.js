import { validate } from 'isemail'

import validPhone from '../utils/validPhone'

export default (data) => {
  if (data.payload) {
    const email = validate(data.payload.email)

    if (email) {
      const dialCode = typeof data.payload.dialCode === 'string' && typeof dialCodes.filter((e) => e.dial === data.payload.dialCode) !== 'undefined' ? data.payload.dialCodev : false
      const phone = validPhone(data)
      const firstName = typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
      const lastName = typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
      const password = typeof data.payload.password === 'string' && data.payload.password.trim().length > 11 ? data.payload.password.trim() : false
      const tosAgreement = typeof data.payload.tosAgreement === 'boolean' && data.payload.tosAgreement === true ? data.payload.tosAgreement : false
      const address = typeof data.payload.address === 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false
      const zipCode = typeof data.payload.zipCode === 'string' && data.payload.zipCode.trim().length >= 5 ? data.payload.zipCode.trim() : false
      const city = typeof data.payload.city === 'string' && data.payload.city.trim().length > 0 ? data.payload.city.trim() : false
      const country = typeof data.payload.country === 'string' && data.payload.country.trim().length > 0 ? data.payload.country.trim() : false

      return {
        dialCode,
        phone,
        firstName,
        lastName,
        email: data.payload.email,
        password,
        tosAgreement,
        address,
        zipCode,
        city,
        country
      }
    } else {
      return false
    }
  } else {
    return false
  }
}
