export const schema = {
  'id': '/Confirm',
  'type': 'object',
  'properties': {
    'token': {'type': 'string'},
    'action': {'type': 'string'}
  },
  'required': ['token', 'action']
}
