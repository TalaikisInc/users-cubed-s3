import config from '../../config'
import sendTwilioSMS from './twilio'

export default config.mobileProvider === 'twilio' ? sendTwilioSMS : {}
