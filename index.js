import workers from './lib/workers'
import server from './lib/server'
const app = {}

app.init = () => {
  server.init()
  workers.init()
}

app.init()

export default app
