require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? './.env' : './.env.dev' })
const { strictEqual } = require('assert')
strictEqual(typeof process.env.HASH_SECRET, 'string', 'You need hash secret!')
strictEqual(typeof process.env.TWILIO_FROM, 'string', 'You need Twilio from!')
strictEqual(typeof process.env.TWILIO_SID, 'string', 'You need TWILIO_SID!')
strictEqual(typeof process.env.TWILIO_AUTH_TOKEN, 'string', 'You need TWILIO_AUTH_TOKEN!')
strictEqual(typeof process.env.MAILGUN_FROM, 'string', 'You need MAILGUN_FROM!')
strictEqual(typeof process.env.MAILGUN_DOMAIN, 'string', 'You need MAILGUN_DOMAIN!')
strictEqual(typeof process.env.MAILGUN_KEY, 'string', 'You need MAILGUN_KEY!')

export default {
  port: 3000,
  company: 'Talaikis Ltd.',
  hashingSecret: process.env.HASH_SECRET,
  logging: true,
  mobileProvider: 'twilio',
  emailProvider: 'mailgun',
  twilio: {
    from: process.env.TWILIO_FROM,
    sid: process.env.TWILIO_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN
  },
  mailgun: {
    nameFrom: process.env.MAILGUN_FROM,
    domainName: process.env.MAILGUN_DOMAIN,
    apiKey: process.env.MAILGUN_KEY
  },
  workers: {
    tokenClean: 60 * 60,
    logRotate: 60 * 60 * 24,
    unconfirmedClean: 60 * 60 * 3
  },
  tokenExpiry: 60 * 60,
  mainConfirm: 'email',
  baseUrl: 'http://localhost:3000/'
}
