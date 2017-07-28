const base64 = require('base-64')
const request = require('request')

let patterns = module.exports.patterns = {
  photobucket: /photobucket\.com/,

  // https://i282.photobucket.com/albums/kk251/BKL93908/NORTON%20TANK%20on%20V11_zpsibge9erf.jpg
  // http://i101.photobucket.com/albums/m52/wingless-pics/Jeep/Oil%20Pump%20Exposed.jpg
  directHtml: /\w*\.photobucket\.com\/(albums\/([\w\-]+)\/([\w\-]+)\/(.*))/,

  // http://s28.photobucket.com/user/docchaynes/media/IMG_2077.JPG.jpeg.html
  // http://s28.photobucket.com/user/docchaynes/media/FullSizeRender.jpg_2.jpeg.html
  // http://s1128.photobucket.com/user/timscudder/media/v11com%20misc%20photos%20posted/IMG_4380.jpg.html
  mediaHtml: /photobucket\.com\/user\/([\w\-]+)\/media\/(.*).html/,

  // http://img.photobucket.com/albums/v619/jere/garage%20journal/IMG_20150205_125121_zpsbjjagykv.jpg
  direct: /img\.photobucket\.com\/(albums\/([\w\-]+)\/([\w\-]+)\/(.*))/,

  mediaGeneric: /photobucket\.com\/user\/([\w\-]+)\/media\/(.*)/,

  gallery: /photobucket\.com\/gallery\/user\/([\w\-]+)\/media\/(\w+)/,

  library: /photobucket\.com\/user\/([\w\-]+)\/library\/(.+)/,
}

const getMediaId = (filename) => base64.encode('path:' + filename)

const toHttps = (url) => url.replace(/^https?/, 'https')

const getMediaUrl = (username, filename) => {
  return `http://photobucket.com/gallery/user/${username}/media/${getMediaId(filename)}`
}

const toMediaSubdomain = (url) => {
  return url.replace(/https?:\/\/(\w+)\.photobucket.com\/(.*)/, 'https://$1.media.photobucket.com/$2')
}

const resolveDirectUrl = (options) => {
  return new Promise((resolve, reject) => {
    let req = {
      url: 'http://photobucket.com/galleryd/search.php',
      form: {
        url: options.url || '',
        ref: '',
        userName: options.username || '',
        searchTerm: options.searchTerm || '',
        mediaId: options.mediaId || ''
      }
    }

    request.post(req, (err, resp, body) => {
      if (err) return reject(err || 'Photobucket returned an unknown error')

      let content, imageUrl

      try {
        content = JSON.parse(body)
        let docs = content.mediaDocuments
        imageUrl = docs.imageUrl || docs.media[docs.mediaIndex].fileUrl
      } catch (err) {
        return reject('Could not parse photobucket response')
      }

      if (imageUrl) {
        return resolve(imageUrl)
      } else {
        return reject('Could not resolve image url. Maybe try again?')
      }
    })
  })
}
module.exports.resolveDirectUrl = resolveDirectUrl

const transformUrlParts = (parts) => {
  return Object.assign({}, parts, {
    key: decodeURIComponent(parts.key),
    mediaId: parts.mediaId || getMediaId(parts.filename)
  })
}
module.exports.transformUrlParts = transformUrlParts

const test = url => patternName => patterns[patternName].test(url)

const matchDirect = (pbUrl) => {
  let parts = pbUrl.match(patterns.direct)
  let [,key, album, username, filename] = parts
  return Promise.resolve(transformUrlParts({ url: pbUrl, key, album, username, filename }))
}
module.exports.matchDirect = matchDirect

const matchMediaHtml = (pbUrl) => {
  let [,username, filename] = pbUrl.match(patterns.mediaHtml)

  return resolveDirectUrl({ url: toMediaSubdomain(pbUrl) })
    .then((url) => {
      let [,key] = url.match(patterns.directHtml)
      return transformUrlParts({ url, username, filename, key })
    })
}
module.exports.matchMediaHtml = matchMediaHtml

const matchMediaGeneric = (pbUrl) => {
  let [,username, filename] = pbUrl.match(patterns.mediaGeneric)

  return resolveDirectUrl({ url: toMediaSubdomain(pbUrl) })
    .then((url) => {
      let [, key] = url.match(patterns.directHtml)
      return transformUrlParts({ url, username, filename, key })
    })
}

const matchMediaGallery = (pbUrl) => {
  let [,username, mediaId] = pbUrl.match(patterns.gallery)
  let filename

  try {
    let decodedMediaId = base64.decode(mediaId)
    let [,filename] = decodedMediaId.match(/(?:path|mediaId):(.+)/)
  } catch (e) {
    return Promise.reject('Could not decode filename')
  }

  return resolveDirectUrl({ username, mediaId })
    .then((url) => {
      let [, key] = url.match(patterns.directHtml)
      return transformUrlParts({ url: toHttps(url), username, filename, mediaId, key })
    })
}

const matchDirectHtml = (pbUrl) => {
  let parts = pbUrl.match(patterns.directHtml)
  let [,key, album, username, filename] = parts
  return Promise.resolve(transformUrlParts({ key, url: toHttps(pbUrl), username, filename }))
}

const parseUrl = (pbUrl) => {
  const testUrl = test(pbUrl)

  if (!patterns.photobucket.test(pbUrl)) return Promise.reject('Not a photobucket url')
  if (patterns.library.test(pbUrl)) return Promise.reject('Can\'t parse library urls')

  if (testUrl('direct')) return matchDirect(pbUrl)
  if (testUrl('mediaHtml')) return matchMediaHtml(pbUrl)
  if (testUrl('mediaGeneric')) return matchMediaGeneric(pbUrl)
  if (testUrl('gallery')) return matchMediaGallery(pbUrl)
  if (testUrl('directHtml')) return matchDirectHtml(pbUrl)

  return Promise.reject('Could\'t parse photobucket url')
}

module.exports.parseUrl = parseUrl
