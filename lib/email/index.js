import sendMailgunEmail from './mailgun'
import config from '../../config'

export default config.emailProvider === 'mailgun' ? sendMailgunEmail : {}
