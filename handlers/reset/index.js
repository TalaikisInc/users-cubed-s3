import config from '../../config'
import { read, create } from '../../lib/data/functions'
import { user } from '../../lib/data/userObj'
import { randomIDAsync } from '../../lib/security/randomID'
import sendEmail from '../../lib/email'
import sendSMS from '../../lib/phone'
import { t, setLocaleAsync } from '../../lib/translations'
import { resetSchema } from './schema'

const sendEmailReset = async (email, done) => {
  const token = await randomIDAsync(32).catch(() => done(t('error_confirmation_generate')))
  const subject = t('reset_email', { company: config.company })
  const msg = t('reset_email_text', { baseUrl: config.baseUrl, code: token })
  const obj = {
    email,
    type: 'reset',
    token: token,
    expiry: Date.now() + 1000 * 60 * 60
  }

  await create('confirms', token, obj).catch(() => done(t('error_confirmation_save')))
  sendEmail(email, subject, msg, (err) => {
    if (!err) {
      done(false)
    } else {
      done(err)
    }
  })
}

const sendPhoneConfirmation = async (phone, email, done) => {
  const token = await randomIDAsync(6).catch(() => done(t('error_confirmation_generate')))
  const msg = t('account_reset_phone', { company: config.company, code: token })
  const obj = {
    email,
    type: 'reset',
    token: token,
    expiry: Date.now() + 1000 * 60 * 60
  }

  await create('confirms', token, obj).catch(() => done(t('error_confirmation_save')))
  sendSMS(phone, msg, (err) => {
    if (!err.error) {
      done(false)
    } else {
      done(err)
    }
  })
}

const sendReset = async (email, phone, done) => {
  if (config.mainConfirm === 'email') {
    await sendEmailReset(email, (err) => {
      if (!err) {
        done(false)
      } else {
        done(err)
      }
    })
  } else if (config.mainConfirm === 'phone') {
    await sendPhoneConfirmation(phone, email, (err) => {
      if (!err) {
        done(false)
      } else {
        done(err)
      }
    })
  }
}

export default async (data, done) => {
  const valid = await resetSchema.isValid(data.payload)
  if (valid) {
    await setLocaleAsync(data)
    const u = await user(data).catch(() => done(400, { error: t('error_required') }))
    if (u.email) {
      const userData = await read('users', u.email).catch(() => done(400, { error: t('error_no_user') }))
      if (userData) {
        await sendReset(u.email, userData.phone, (err) => {
          if (!err.error) {
            done(200, { status: t('ok') })
          } else {
            done(500, { error: t('error_email') })
          }
        })
      } else {
        done(400, { error: t('error_no_user') })
      }
    } else {
      done(400, { error: t('error_required') })
    }
  } else {
    done(400, { error: t('error_required') })
  }
}
