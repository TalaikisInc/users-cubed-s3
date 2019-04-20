require('@babel/polyfill')
require('@babel/register')({
  presets: ['@babel/preset-env']
})

module.exports = require('./index.js')
