import { locale, fallback, set, t } from 'frenchkiss'

import en from './en'
import fr from './fr'

set('fr', fr)
set('en', en)

export const setLocale = (data, done) => {
  const loc = typeof data.payload.locale === 'string' ? data.payload.locale : 'en'
  locale(loc)
  done()
}

fallback('en')

export { t }
