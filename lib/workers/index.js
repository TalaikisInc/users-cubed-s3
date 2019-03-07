import tokenWorker from './tokens'
import unconfirmedWorker from './unconfirmedClean'

const workers = {}

workers.init = () => {
  tokenWorker.loop()
  unconfirmedWorker.loop()
}

export default workers
