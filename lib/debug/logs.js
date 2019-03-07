import { gzip, unzip } from 'zlib'
import { open, appendFile, readdir, readFile, ftruncate } from 'fs'
import { join } from 'path'

import log from './log'
import error from './error'
import write from './../data/write'
import closeFile from './../data/close'

const logs = {}

logs.baseDir = join(__dirname, '../../.logs')

logs.append = (file, msg, done) => {
  open(join(logs.baseDir, `${file}.log`), 'a', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      appendFile(fileDescriptor, `${msg}\n`, (err) => {
        if (!err) {
          closeFile(fileDescriptor, done)
        } else {
          done(`Cannot append to log file: ${err.message}`)
        }
      })
    } else {
      done(`Cannot open log file: ${err.message}`)
    }
  })
}

logs.list = (include, done) => {
  readdir(logs.baseDir, (err, data) => {
    if (!err && data && data.length > 0) {
      const trimmed = []
      data.forEach((fileName) => {
        if (fileName.indexOf('.log') > -1) {
          trimmed.push(fileName.replace('.log', ''))
        }

        if (fileName.indexOf('.gz.b64' && include) > -1) {
          trimmed.push(fileName.replace('.gz.b64', ''))
        }
        done(false, trimmed)
      })
    } else {
      done(err, data)
    }
  })
}

logs.rotate = () => {
  logs.list(false, (err, logs) => {
    if (!err && logs && logs.length > 0) {
      logs.forEach((logName) => {
        if (logName !== '.gitkeep') {
          const logId = logName.replace('.log', '')
          const dt = Date.now()
          const compressedName = `${logId}_${dt}`
          compress(logId, compressedName, (err) => {
            if (!err) {
              truncateFiles(logId, (err) => {
                if (!err) {
                  log('Logs truncated,', 'FgGreen')
                } else {
                  error(`Truncating log error: ${err.message}`)
                }
              })
            } else {
              error(`Compression error: ${err.message}`)
            }
          })
        }
      })
    } else {
      log('No logs to rotate.')
    }
  })
}

const compress = (logId, compressedId, done) => {
  const sourceFile = `${logId}.log`
  const destFile = `${compressedId}.gz.b64`

  readFile(join(logs.baseDir, sourceFile), 'utf8', (err, inputStr) => {
    if (!err && inputStr) {
      gzip(inputStr, (err, buffer) => {
        if (!err && buffer) {
          open(join(logs.baseDir, destFile), 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
              write(fileDescriptor, buffer.toString('base64'), done)
            } else {
              done(err)
            }
          })
        } else {
          done(err)
        }
      })
    } else {
      done(err)
    }
  })
}

const truncateFiles = (logId, done) => {
  const sourceFile = join(logs.baseDir, `${logId}.log`)
  open(sourceFile, 'r+', (err, descriptor) => {
    if (!err && descriptor) {
      ftruncate(descriptor, 0, (err) => {
        if (!err) {
          done(false)
        } else {
          done(err)
        }
      })
    } else {
      done(err)
    }
  })
}

logs.decompress = (fileId, done) => {
  const destFile = `${fileId}.gz.b64`
  readFile(join(logs.baseDir, destFile), 'utf8', (err, str) => {
    if (!err && str) {
      const buffer = Buffer.from(str, 'base64')
      unzip(buffer, (err, ouputBuffer) => {
        if (!err && ouputBuffer) {
          const strOutput = ouputBuffer.toString()
          done(false, strOutput)
        } else {
          done(err)
        }
      })
    } else {
      done(err)
    }
  })
}

export default logs
