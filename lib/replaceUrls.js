module.exports = (text, originalUrls, newUrls) => {
  return originalUrls.reduce((result, url, i) => {
    const pattern = new RegExp(url, 'g')
    return result.replace(pattern, newUrls[i] || url)
  }, text)
}
