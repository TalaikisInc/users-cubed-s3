export default (data) => {
  if (data.authorization) {
    const token = data.authorization.replace('Bearer ', '')
    return typeof token === 'string' && token.length === 64 ? token : false
  } else {
    return false
  }
}
