import { getData, save, remove, list } from '../s3'

const dataLib = {}

dataLib.create = (dir, file, data, done) => {
  save(`${dir}/${file}`, data, (err, res) => {
    if (!err && res) {
      done(false, res)
    } else {
      done('Cannot create new file.')
    }
  })
}

dataLib.read = (dir, file, done) => {
  getData(`${dir}/${file}`, (err, data) => {
    if (!err && data) {
      done(false, data)
    } else {
      done('Cannot read.')
    }
  })
}

dataLib.update = (dir, file, newData, done) => {
  getData(`${dir}/${file}`, (err, data) => {
    if (!err && data) {
      remove(`${dir}/${file}`, (err, removed) => {
        if (!err && removed) {
          save(`${dir}/${file}`, newData, (err, res) => {
            if (!err && res) {
              done(false, res)
            } else {
              done('Cannot save.')
            }
          })
        } else {
          done('Error truncating.')
        }
      })
    } else {
      done('Cannot open for updating.')
    }
  })
}

dataLib.delete = (dir, file, done) => {
  remove(`${dir}/${file}`, (err, res) => {
    if (!err && res) {
      done(false, res)
    } else {
      done('Cannot delete.')
    }
  })
}

dataLib.list = (dir, done) => {
  list(`${dir}/`, (err, data) => {
    if (!err && data) {
      done(false, data)
    } else {
      done('Cannot list.')
    }
  })
}

export default dataLib
