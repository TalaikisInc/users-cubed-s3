import querystring from 'querystring'
import { App } from 'uWebSockets.js'

import workers from './lib/workers'
import config from './config'
import handlers from './handlers'
import log from './lib/debug/log'
import error from './lib/debug/error'
import json from './lib/server/json'
import statusCodes from './lib/utils/statusCodes'
const port = config.port
const app = {}

app.init = () => {
  App().get('/', (res, req) => {
    res.writeStatus('200 OK.')
    res.writeHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ status: 'Running.' }))
  })
  .post('/api', (res, req) => {
    const authorization = req.getHeader('authorization')
    json(res, (payload) => {
      payload = typeof payload === 'string' ? querystring.parse(payload) : payload
      const data = {
        authorization,
        payload
      }

      const handler = typeof handlers[payload.action] !== 'undefined' ? handlers[payload.action] : handlers['NOT_FOUND']

      handler(data, (statusCode, out) => {
        statusCode = typeof statusCode === 'number' ? statusCode : 400
        out = typeof out === 'object' ? out : {}
        out = JSON.stringify(out)
        res.writeStatus(`${statusCode} ${statusCodes[statusCode]}`)
        res.writeHeader('Content-Type', 'application/json')
        res.end(out)
      })
    })
  }).listen(port, (token) => {
    if (token) {
      log(`Listening to port ${port}`)
    } else {
      error(`Failed to listen to port ${port}`)
    }
  })

  workers.init()
}

app.init()

export default app
