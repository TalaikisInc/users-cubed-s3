import dataLib from './functions'

export default (table, col, done) => {
  const toDelete = col.length
  if (toDelete > 0) {
    let deleted = 0
    let errors = false
    col.forEach((id) => {
      dataLib.delete(table, id, (err) => {
        if (!err) {
          deleted += 1
        } else {
          errors = true
        }

        if (deleted === toDelete) {
          if (!errors) {
            done(false)
          } else {
            done(`Error occured when deleting some ${col} fomr ${table}.`)
          }
        }
      })
    })
  } else {
    done(false)
  }
}
