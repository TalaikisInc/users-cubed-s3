import workers from './lib/workers'
import server from './lib/server'
// import monitor from './lib/monitor'
const app = {}

app.init = () => {
  server.init()
  workers.init()
  // monitor()
}

app.init()

export default app
