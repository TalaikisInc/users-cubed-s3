import { createCipher, createDecipher } from 'crypto'

export const encrypt = (msg, password, callbac) => {
  const cipher = createCipher('aes256', password)
  let encrypted = ''

  cipher.on('readable', () => {
    const data = cipher.read()
    if (data) {
      encrypted += data.toString('hex')
    }
  })

  cipher.on('end', () => {
    callbac(encrypted)
  })

  cipher.write(msg)
  cipher.end()
}

export const decrypt = (encrypted, password, callbac) => {
  const decipher = createDecipher('aes256', password)
  let decrypted = ''

  decipher.on('readable', () => {
    const data = decipher.read()
    if (data) {
      decrypted += data.toString('utf8')
    }
  })

  decipher.on('end', () => {
    callbac(decrypted)
  })

  decipher.write(encrypted, 'hex')
  decipher.end()
}
