import config from '../../config'

export default (msg, color) => {
  if (config.logging) {
    console.log(msg)
  }
}
