import http from 'http'
import querystring from 'querystring'
import { StringDecoder } from 'string_decoder'

import config from '../../config'
import handlers from '../../handlers'
import log from '../../lib/debug/log'
import error from '../../lib/debug/error'
import stringToJson from '../../lib/utils/stringToJson'

const server = http.createServer((req, res) => {
  let { method, headers } = req
  if (method === 'POST') {
    const decoder = new StringDecoder('utf-8')
    let buffer = ''

    req.on('data', (data) => {
      buffer += decoder.write(data)
    })

    req.on('error', (err) => {
      error(err)
    })

    req.on('end', () => {
      buffer += decoder.end()

      stringToJson(buffer, (inPayload) => {
        inPayload = typeof inPayload === 'string' ? querystring.parse(inPayload) : inPayload
        const data = {
          headers,
          payload: inPayload
        }

        const handler = typeof handlers[inPayload.action] !== 'undefined' ? handlers[inPayload.action] : handlers['NOT_FOUND']

        handler(data, (statusCode, outPayload) => {
          statusCode = typeof statusCode === 'number' ? statusCode : 400
          res.setHeader('Content-Type', 'application/json')
          outPayload = typeof outPayload === 'object' ? outPayload : {}
          outPayload = JSON.stringify(outPayload)
          res.writeHead(statusCode)
          res.end(outPayload)
        })
      })
    })
  } else {
    res.writeHead(405)
    res.end(JSON.stringify({}))
  }
})

server.on('error', (err) => {
  error(err)
})

const port = config.port

server.init = () => {
  server.listen(port, () => {
    log(`Server listens to ${port}`, 'FgGreen')
  })
}

export default server