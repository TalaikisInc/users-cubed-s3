export const createSchema = {
  'id': '/TokenCreate',
  'type': 'object',
  'properties': {
    'email': {'type': 'string'},
    'password': {'type': 'string'},
    'action': {'type': 'string'}
  },
  'required': ['email', 'password', 'action']
}
