export default (msg, done) => {
  try {
    done(JSON.parse(msg))
  } catch (e) {
    done(msg)
  }
}
