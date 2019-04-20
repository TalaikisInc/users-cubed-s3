import config from '../../config'
import dataLib from '../../lib/data/functions'
import userObj from '../../lib/data/userObj'
import randomID from '../../lib/security/randomID'
import sendEmail from '../../lib/email'
import sendSMS from '../../lib/phone'
import { t, setLocale } from '../../lib/translations'

const sendEmailReset = (email, done) => {
  randomID(32, (code) => {
    if (code) {
      const subject = t('reset_email', { company: config.company })
      const msg = t('reset_email_text', { baseUrl: config.baseUrl, cod: code })
      const obj = {
        email,
        type: 'reset',
        token: code,
        expiry: Date.now() + 1000 * 60 * 60
      }

      dataLib.create('confirms', code, obj, (err) => {
        if (!err) {
          sendEmail(email, subject, msg, (err) => {
            if (!err.error) {
              done(false)
            } else {
              done(err)
            }
          })
        } else {
          done(t('error_confirmation_save'))
        }
      })
    } else {
      done(t('error_confirmation_generate'))
    }
  })
}

const sendPhoneConfirmation = (phone, email, done) => {
  randomID(6, (code) => {
    if (code) {
      const msg = t('account_reset_phone', { company: config.company, code: code })
      const obj = {
        email,
        type: 'reset',
        token: code,
        expiry: Date.now() + 1000 * 60 * 60
      }

      dataLib.create('confirms', code, obj, (err) => {
        if (!err) {
          sendSMS(phone, msg, (err) => {
            if (!err.error) {
              done(false)
            } else {
              done(err)
            }
          })
        } else {
          done(t('error_confirmation_save'))
        }
      })
    } else {
      done(t('error_confirmation_generate'))
    }
  })
}

const sendReset = (email, phone, done) => {
  if (config.mainConfirm === 'email') {
    sendEmailReset(email, (err) => {
      if (!err) {
        done(false)
      } else {
        done(err)
      }
    })
  } else if (config.mainConfirm === 'phone') {
    sendPhoneConfirmation(phone, email, (err) => {
      if (!err) {
        done(false)
      } else {
        done(err)
      }
    })
  }
}

export default async (data, done) => {
  setLocale(data, () => {
    userObj(data, (u) => {
      if (u) {
        if (u.email) {
          dataLib.read('users', u.email, (err, userData) => {
            if (!err && userData) {
              sendReset(u.email, userData.phone, (err) => {
                if (!err.error) {
                  done(200, { status: t('ok') })
                } else {
                  done(500, { error: t('error_email') })
                }
              })
            } else {
              done(400, { error: t('error_no_user') })
            }
          })
        } else {
          done(400, { error: t('error_required') })
        }
      } else {
        done(400, { error: t('error_required') })
      }
    })
  })
}
