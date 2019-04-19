export default (data, done) => {
  if (data.headers && typeof data.headers.authorization === 'string') {
    let token = data.headers.authorization.replace('Bearer ', '')
    token.length === 64 ? token : false
    done(token)
  } else {
    done(false)
  }
}
