const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

module.exports = (key) => {
  const target = key.replace(' ', '\ ')
  const dirname = path.dirname(target)

  mkdirp.sync(dirname)

  const writeStream = fs.createWriteStream(target)

  return writeStream
}
