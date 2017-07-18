const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const stream = require('stream')

const { S3_BUCKET } = process.env
const host = `https://s3.amazonaws.com/${S3_BUCKET}`

module.exports.buildUrl = (key) => {
  return [host, key].join('/')
}

module.exports.uploadStream = (key, callback) => {
  var passThrough = new stream.PassThrough()

  s3.upload({
    Bucket: S3_BUCKET,
    ContentType: 'image/jpeg',
    Key: key,
    Body: passThrough
  }).send((err, details) => {
    if (err) return callback(err)
    callback(null, details)
  })

  return passThrough
}

module.exports.getObject = (key) => {
  const params = {
    Bucket: S3_BUCKET,
    Key: key
  }

  return new Promise((resolve, reject) => {
    s3.getObject(params)
      .on('success', (response) => {
        const key = encodeURIComponent(response.request.params.Key)
        resolve(key)
      })
      .on('error', (error) => reject(error))
      .send()
  })
}
