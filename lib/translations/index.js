import { locale, fallback, set, t } from 'frenchkiss'

import en from './en'
import fr from './fr'

set('fr', fr)
set('en', en)

locale('en')
fallback('en')

export default t
