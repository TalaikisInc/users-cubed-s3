export default (data) => {
  if (data.headers && data.headers.authorization) {
    const token = data.headers.authorization.replace('Bearer ', '')
    return typeof token === 'string' && token.length === 64 ? token : false
  } else {
    return false
  }
}
