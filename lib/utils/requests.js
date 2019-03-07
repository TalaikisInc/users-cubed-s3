import http from 'http'
import https from 'https'
import { stringify } from 'querystring'

import error from '../debug/error'

export default (schema, obj, done) => {
  const schemaLib = typeof schema === 'string' && schema === 'http' ? http : https
  const payloadString = stringify(obj.data)
  obj.headers['Content-Length'] = Buffer.byteLength(payloadString)

  const req = schemaLib.request(obj, (res) => {
    const status = res.statusCode
    if (status === 200 || status === 201) {
      done({ error: false })
    } else {
      done({ error: status })
    }
  })

  req.on('error', (err) => {
    // @TODO log here
    error(err.message)
    done({ error: err.message })
  })

  req.on('timeout', () => {
    // @TODO log here
    done({ error: 'Request timed out.' })
  })

  req.write(payloadString)
  req.end()
}
