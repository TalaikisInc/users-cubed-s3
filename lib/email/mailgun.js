import { validate } from 'isemail'
import { strictEqual } from 'assert'

import config from '../../config'
import request from '../utils/requests'

strictEqual(typeof config.mailgun.domainName, 'string')
strictEqual(typeof config.mailgun.apiKey, 'string')
strictEqual(typeof config.mailgun.nameFrom, 'string')

export default (email, subject, msg, done) => {
  const validMsg = typeof msg === 'string' && msg.trim().length > 0 ? msg.trim() : false

  if (validate(email) && validMsg) {
    // const logo = createReadStream(join(__dirname, '../../.data', 'assets', 'logo.png'))
    // const htmlMsg = `<img src="cid:logo.png" width="200px"><br /><h3>${subject}</h3><p>${msg}</p>`

    const obj = {
      protocol: 'https:',
      hostname: 'api.mailgun.net',
      method: 'POST',
      path: `/v3/${config.mailgun.domainName}/messages`,
      auth: `api:${config.mailgun.apiKey}`,
      data: {
        from: `${config.mailgun.nameFrom} <mailgun@${config.mailgun.domainName}>`,
        to: email,
        subject: subject,
        text: msg,
        html: msg
        // text: msg,
        // inline: [logo]
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    request('https', obj, (err) => {
      if (!err) {
        done(false)
      } else {
        done(err)
      }
    })
  } else {
    done({ error: 'Send email parameters missing or are invalid.' })
  }
}
