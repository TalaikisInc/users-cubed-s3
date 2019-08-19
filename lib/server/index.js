import http from 'http'
import querystring from 'querystring'
import { StringDecoder } from 'string_decoder'
import morgan from 'morgan'
import rfs from 'rotating-file-stream'
import { resolve } from 'path'

import config from '../../config'
import handlers from '../../handlers'
import log from '../../lib/debug/log'
import error from '../../lib/debug/error'
import stringToJson from '../../lib/utils/stringToJson'
import setHeaders from './headers'
const accessLogStream = rfs('access.log', {
  interval: '1d',
  path: resolve(__dirname, '../../.logs')
})
const logger = morgan(':date[clf] :method :url :status :response-time ms :referrer :remote-addr - :remote-user', { stream: accessLogStream })

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
      logger(req, res, (err) => {
        if (err) error(err)
        buffer += decoder.end()
        stringToJson(buffer, async (err, inPayload) => {
          if (!err && inPayload) {
            inPayload = typeof inPayload === 'string' ? querystring.parse(inPayload) : inPayload
            if (inPayload.key === process.env.API_KEY) {
              const data = {
                headers,
                payload: inPayload
              }
              console.log('inPayload')
              console.log(inPayload)

              const handler = typeof handlers[inPayload.action] !== 'undefined' ? handlers[inPayload.action] : handlers['NOT_FOUND']

              await handler(data, (statusCode, outPayload) => {
                statusCode = typeof statusCode === 'number' ? statusCode : 400
                setHeaders(res, () => {
                  outPayload = typeof outPayload === 'object' ? outPayload : { status: 'Running.' }
                  outPayload = JSON.stringify(outPayload)
                  console.log('outPayload')
                  console.log(outPayload)
                  res.writeHead(statusCode)
                  res.end(outPayload)
                })
              })
            } else {
              setHeaders(res, () => {
                res.writeHead(403)
                res.end(JSON.stringify({ error: 'Wrong or no API key.' }))
              })
            }
          } else {
            setHeaders(res, () => {
              res.writeHead(400)
              res.end(JSON.stringify({ error: err }))
            })
          }
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