const getMatchedPosts = require('./getMatchedPosts')
const updatePosts = require('./updatePosts')

module.exports = (config) => {
  return getMatchedPosts(config)
    .then((results) => {
      return updatePosts(config, results)
    })
}
