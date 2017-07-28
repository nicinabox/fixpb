const ora = require('ora')
const axios = require('axios')
const photobucket = require('../lib/photobucket')
const localWriteStream = require('../lib/localWriteStream')

const download = ({url, key, username, mediaId}, config) => {
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
      resp.data
        .pipe(localWriteStream(toLocalPath(config, key)))
        .on('finish', () => {
          resolve(toPrefixedPath(config, key))
        })
        .on('error', (err) => {
          reject(err)
        })
    })
    .catch((err) => {
      clearTimeout(timer)
      if (err.response) {
        let error = `${err.response.statusText}: ${url}`
        spinner.fail(error)
      } else {
        spinner.fail(err)
      }
      resolve()
    })
  })
}

const downloadFile = (url, config) => {
  let parts = photobucket.parseUrl(url)
  if (!parts.url) return Promise.reject('No url to follow')

  return download(parts, config)
}

module.exports = (urls, config) => {
  return Promise.all(urls.map((url) => downloadFile(url, config)))
}
