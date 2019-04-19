import { object, string } from 'yup'

export default object().shape({
  email: string().required().email(),
  password: string().required().min(12),
  key: string().required(),
  action: string().required(),
  locale: string().required().oneOf(['en', 'fr'])
})
