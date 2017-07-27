const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

module.exports = (key, callback) => {
  const target = key.replace(' ', '\ ')
  const dirname = path.dirname(target)

  mkdirp.sync(dirname)

  const writeStream = fs.createWriteStream(target)
    .on('error', (error) => {
      console.log(error);
    })
    .on('finish', () => {
      callback(target)
    })

  return writeStream
}
