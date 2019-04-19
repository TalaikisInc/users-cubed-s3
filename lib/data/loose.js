import validPhone from '../utils/validPhone'
import dialCodes from './dialCodes'
import countries from './countries'

export default (data, done) => {
  const { firstName, lastName, dialCode, password, tosAgreement, address, zipCode, city, country, avatarUrl, dob } = data.payload
  const _dialCode = typeof dialCode === 'string' && typeof dialCodes.filter((e) => e.dial === dialCode) !== 'undefined' ? dialCode : false
  const _phone = validPhone(data)
  const _firstName = typeof firstName === 'string' && firstName.trim().length > 0 ? firstName.trim() : false
  const _lastName = typeof lastName === 'string' && lastName.trim().length > 0 ? lastName.trim() : false
  const _password = typeof password === 'string' && password.trim().length > 11 ? password.trim() : false
  const _tosAgreement = typeof tosAgreement === 'boolean' && tosAgreement === true ? tosAgreement : false
  const _address = typeof address === 'string' && address.trim().length > 0 ? address.trim() : false
  const _zipCode = typeof zipCode === 'string' && zipCode.trim().length >= 5 ? zipCode.trim() : false
  const _city = typeof city === 'string' && city.trim().length > 0 ? city.trim() : false
  const _country = typeof country === 'string' && typeof countries.filter((e) => e.country === country) !== 'undefined' ? country.trim() : false
  const _avatarUrl = typeof avatarUrl === 'string' && avatarUrl.trim().length > 0 ? avatarUrl.trim() : false
  const _dob = typeof dob === 'string' && dob.trim().length > 0 ? dob.trim() : false

  done({
    dialCode: _dialCode,
    phone: _phone,
    firstName: _firstName,
    lastName: _lastName,
    email: data.payload.email,
    password: _password,
    tosAgreement: _tosAgreement,
    address: _address,
    zipCode: _zipCode,
    city: _city,
    country: _country,
    avatarUrl: _avatarUrl,
    dob: _dob
  })
}
