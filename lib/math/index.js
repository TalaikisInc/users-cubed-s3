export const asyncAvg = (n, avgCB) => {
  // Save ongoing sum in JS closure.
  var sum = 0
  function helper (i, cb) {
    sum += i
    if (i === n) {
      cb(sum)
      return
    }

    // Schedule next operation asynchronously.
    setImmediate(helper.bind(null, i + 1, cb))
  }

  // Start the helper, with CB to call avgCB.
  helper(1, (sum) => {
    let avg = sum / n
    avgCB(avg)
  })
}
