export default (data) => {
  if (data.payload) {
    return typeof data.payload.phone === 'string' && data.payload.phone.trim().length >= 11 ? data.payload.phone.trim() : false
  } else {
    return false
  }
}
