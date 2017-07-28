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
  const spinner = ora().start()

  return connect(config.db)
    .then((db) => {
      const q = queries(db, config)

      const updatePosts = results.map(({post_id, post_text, urls}) => () => {
        return downloadFiles(urls, config)
          .then((nextUrls) => {
            return q.updatePost(post_id, replaceUrls(post_text, urls, nextUrls))
          })
          .then(() => {
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
