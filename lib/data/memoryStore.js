const calculateNextResetTime = (windowMs) => {
  const d = new Date()
  d.setMilliseconds(d.getMilliseconds() + windowMs)
  return d
}

const MemoryStore = (windowMs) => {
  let hits = {}
  let resetTime = calculateNextResetTime(windowMs)

  this.incr = (key, cb) => {
    if (hits[key]) {
      hits[key]++
    } else {
      hits[key] = 1
    }

    cb(null, hits[key], resetTime)
  }

  this.decrement = (key) => {
    if (hits[key]) {
      hits[key]--
    }
  }

  // export an API to allow hits all IPs to be reset
  this.resetAll = () => {
    hits = {}
    resetTime = calculateNextResetTime(windowMs)
  }

  // export an API to allow hits from one IP to be reset
  this.resetKey = (key) => {
    delete hits[key]
    delete resetTime[key]
  }

  // simply reset ALL hits every windowMs
  const interval = setInterval(this.resetAll, windowMs)
  if (interval.unref) {
    interval.unref()
  }
}

export default MemoryStore
