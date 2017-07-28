const ora = require('ora')
const connect = require('./db/connect')
const serialPromise = require('../../utils/serialPromise')
const downloadFiles = require('../../lib/downloadFiles')
const replaceUrls = require('../../lib/replaceUrls')

const queries = (db, config) => {
  return {
    getPost(postId) {
      return db.execute(`SELECT post_text FROM ${config.table_prefix}posts WHERE post_id = ?`, [postId])
    },

    updatePost(postId, postHtml) {
      return db.execute(`UPDATE ${config.table_prefix}posts SET post_text = ? WHERE post_id = ?`, [postHtml, postId])
    }
  }
}

module.exports = (config, results) => {
  let updatedCount = 0
  const spinner = ora()

  return connect(config.db)
    .then((db) => {
      const q = queries(db, config)

      const updatePosts = results.map(({post_id, post_text, urls}, i) => () => {
        const postSpinner = ora().start(`Downloading ${urls.length} images for ${post_id}`)

        return downloadFiles(urls, config, postSpinner)
          .then((nextUrls) => {
            postSpinner.text = `Updating ${nextUrls.length} in ${post_id}`
            let nextPost = replaceUrls(post_text, urls, nextUrls)

            return q.updatePost(post_id, nextPost)
              .then(() => nextUrls)
          })
          .then((nextUrls) => {
            postSpinner.succeed(`Updated ${nextUrls.filter(f => f).length} images in ${post_id}, ${results.length - (i + 1)} posts remaining`)
            updatedCount += 1
          })
      })

      return serialPromise(updatePosts)
    })
    .then(() => {
      spinner.succeed(`${updatedCount} posts updated`)
    })
    .catch((err) => {
      spinner.fail(err)
    })
}
