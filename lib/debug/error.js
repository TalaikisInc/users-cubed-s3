import config from '../../config'

export default (msg) => {
  if (config.logging) {
    console.error(msg)
  }
}
