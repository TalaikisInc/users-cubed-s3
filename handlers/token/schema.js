export const createSchema = {
  'id': '/TokenCreate',
  'type': 'object',
  'properties': {
    'email': {
      'type': 'string',
      'format': 'email'
    },
    'password': {
      'type': 'string',
      "minLength": 12
    },
    'locale': {
      'type': 'string',
      "minLength": 2,
      "maxLength": 2
    },
    'action': {
      'enum': ['TOKEN_CREATE']
    }
  },
  'required': ['email', 'password', 'action']
}
