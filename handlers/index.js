import ACTIONS from '../actions'

export default {
  [ACTIONS.USER.CREATE]: require('./users').create,
  [ACTIONS.USER.CREATE_SOCIAL]: require('./users').createSocial,
  [ACTIONS.USER.EDIT]: require('./users').edit,
  [ACTIONS.USER.DESTROY]: require('./users').destroy,
  [ACTIONS.USER.GET]: require('./users').get,
  [ACTIONS.USER.CONFIRM_PHONE]: require('./users').confirmPhone,
  [ACTIONS.USER.SET_ROLE]: require('./users').setRole,
  [ACTIONS.TOKEN.CREATE]: require('./token').create,
  [ACTIONS.TOKEN.EXTEND]: require('./token').extend,
  [ACTIONS.TOKEN.DESTROY]: require('./token').destroy,
  [ACTIONS.TOKEN.GET]: require('./token').get,
  [ACTIONS.CONFIRM]: require('./confirm').default,
  [ACTIONS.REFER.REFER]: require('./refer').refer,
  [ACTIONS.REFER.USE]: require('./refer').use,
  [ACTIONS.REFER.REGISTER]: require('./refer').register,
  [ACTIONS.RESET.CREATE]: require('./reset').default,
  [ACTIONS.PING]: require('./generics/ping').default,
  [ACTIONS.NOT_FOUND]: require('./generics/notFound').default
}
