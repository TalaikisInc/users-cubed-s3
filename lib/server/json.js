export default (res, done, err) => {
  let buffer
  res.onData((payload, isLast) => {
    let chunk = Buffer.from(payload)
    if (isLast) {
      let json
      if (buffer) {
        try {
          json = JSON.parse(Buffer.concat([buffer, chunk]))
        } catch (e) {
          json = {}
        }
        done(json)
      } else {
        try {
          json = JSON.parse(chunk)
        } catch (e) {
          json = {}
        }
        done(json)
      }
    } else {
      if (buffer) {
        buffer = Buffer.concat([buffer, chunk])
      } else {
        buffer = Buffer.concat([chunk])
      }
    }
  })
  res.onAborted(err)
}
