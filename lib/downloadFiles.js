const fs = require('fs')
const axios = require('axios')
const pb = require('./photobucket')
const localWriteStream = require('./localWriteStream')

const toLocalPath = (config, key) => [config.file.location, key].join('/')
const toPrefixedPath = (config, key) => config.file.prefix + key

const download = ({url, key, username, mediaId}, config) => {
  return new Promise((resolve, reject) => {
    let timer = setTimeout(() => {
      reject(`Timed out: ${url}`)
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
      reject(err)
    })
  })
}

const downloadFile = (url, config, spinner) => {
  return pb.parseUrl(url)
    .then((parts) => {
      if (!parts.url) return Promise.reject('No url to follow')
      return parts
    })
    .then((parts) => {
      let file = toLocalPath(config, parts.key)

      if (fs.existsSync(file)) {
        spinner.text = `Already downloaded: ${file}`
        return toPrefixedPath(config, parts.key)
      }

      return download(parts, config)
    })
    .catch((err) => {
      if (err.response) {
        let error = `${err.response.statusText}: ${url}`
        spinner.fail(error)
      } else {
        spinner.fail(err)
      }
    })
}

module.exports = (urls, config, spinner) => {
  return Promise.all(urls.map((url) => downloadFile(url, config, spinner)))
}
