const ora = require('ora')
const axios = require('axios')
const photobucket = require('../lib/photobucket')
const { localWriteStream } = require('../lib/writeStream')

const download = ({url, key, username, mediaId}) => {
  return new Promise((resolve, reject) => {
    const spinner = ora().start(`Trying ${url}`)

    let timer = setTimeout(() => {
      spinner.fail('Timed out')
      reject('Timed out')
    }, 30 * 1000)

    return axios({
      url,
      method: 'get',
      responseType: 'stream',
      headers: {
        referer: `http://photobucket.com/gallery/user/${username}/media/${mediaId}`
      }
    })
    .then((resp) => {
      clearTimeout(timer)
      resp.data.pipe(localWriteStream(key, (target) => {
        spinner.succeed(`Downloaded ${target}`)
        resolve(target)
      }))
    })
    .catch((err) => {
      clearTimeout(timer)
      let error = `${err.response.statusText}: ${url}`
      spinner.fail(error)
      resolve()
    })
  })
}

const downloadFile = (url) => {
  let parts = photobucket.parseUrl(url)
  if (!parts.url) return Promise.reject('No url to follow')

  return download(parts)
}

module.exports = (urls) => {
  return Promise.all(urls.map((url) => downloadFile(url)))
}
