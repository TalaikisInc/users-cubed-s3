import { join } from 'path'
import { asyncMonitor, pkgMonitor } from 'async-optics'

export default () => {
  asyncMonitor(3001)
  // pkgMonitor(join(__dirname, '../../package.json'))
}
