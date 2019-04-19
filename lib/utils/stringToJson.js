export default (msg, done) => {
  try {
    done(false, JSON.parse(msg))
  } catch (e) {
    done(e)
  }
}
