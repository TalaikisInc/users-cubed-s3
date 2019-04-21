import { randomIDAsync } from '../../lib/security/randomID'
import config from '../../config'
import { read, create } from '../../lib/data/functions'
import { user } from '../../lib/data/userObj'
import { hashAsync } from '../../lib/security/hash'
import finalizeRequest from '../../lib/data/finalizeRequest'
import { createSchema, tokenGet, tokenExtend, tokenDestroy } from './schema'
import { t, setLocaleAsync } from '../../lib/translations'

export const get = async (data, done) => {
  const valid = await tokenGet.isValid(data.payload)
  if (valid) {
    await setLocaleAsync(data)
    const tokenData = await read('tokens', data.payload.tokenId).catch(() => done(404, { error: t('error_token_notfound') }))
    done(200, tokenData)
  } else {
    done(400, { error: t('error_required') })
  }
}

const _hash = async (u, userData, done) => {
  const hashed = await hashAsync(u.password).catch((e) => done(500, { error: t('error_internal') }))
  if (userData.password === hashed) {
    const tokenId = await randomIDAsync(32).catch(() => done(400, { error: t('error_id') }))
    const expiry = Date.now() + 1000 * config.tokenExpiry
    const tokenObj = {
      expiry,
      tokenId,
      role: userData.role,
      email: u.email
    }

    await create('tokens', tokenId, tokenObj).catch(() => done(500, { error: t('error_token') }))
    done(200, { token: tokenId })
  } else {
    done(401, { error: t('error_invalid_password') })
  }
}

export const gen = async (data, done) => {
  const valid = await createSchema.isValid(data.payload)
  if (valid) {
    await setLocaleAsync(data)
    const u = await user(data).catch(() => done(400, { error: t('error_required') }))
    if ((u.email && u.password) || (u.phone && u.password)) {
      const userData = await read('users', u.email).catch((e) => done(400, { error: t('error_cannot_read') }))
      if (userData) {
        if (userData.confirmed.email || userData.confirmed.phone) {
          await _hash(u, userData, (status, out) => {
            done(status, out)
          })
        } else {
          done(400, { error: t('error_confirmed') })
        }
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

export const extend = async (data, done) => {
  const valid = await tokenExtend.isValid(data.payload)
  if (valid) {
    await setLocaleAsync(data)
    const id = data.payload.tokenId
    if (id) {
      const tokenData = await read('tokens', id).catch(() => done(400, { error: t('error_token_notfound') }))
      if (tokenData.expiry > Date.now()) {
        tokenData.expiry = Date.now() + 1000 * config.tokenExpiry
        finalizeRequest('tokens', id, 'update', done, tokenData)
      } else {
        done(400, { error: t('error_token_expired') })
      }
    } else {
      done(400, { error: t('error_required') })
    }
  } else {
    done(400, { error: t('error_required') })
  }
}

export const destroy = async (data, done) => {
  const valid = await tokenDestroy.isValid(data.payload)
  if (valid) {
    await setLocaleAsync(data)
    const token = data.payload.tokenId
    if (token) {
      await read('tokens', token).catch(() => done(404, { error: t('error_token_notfound') }))
      finalizeRequest('tokens', token, 'delete', done)
    } else {
      done(400, { error: t('error_required') })
    }
  } else {
    done(400, { error: t('error_required') })
  }
}
