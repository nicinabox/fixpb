const ora = require('ora')
const connect = require('./db/connect')
const serialPromise = require('../../utils/serialPromise')
const downloadFiles = require('../../lib/downloadFiles')

const queries = (db, config) => {
  return {
    getPostText(postId) {
      return db.execute(`SELECT post_text FROM ${config.table_prefix}posts_text WHERE post_id = ?`, [postId])
    },

    updatePostText(postId, postText) {
      return db.execute(`UPDATE ${config.table_prefix}posts_text SET post_text = ? WHERE post_id = ?`, [postText, postId])
    },

    getPost(postId) {
      return db.execute(`SELECT post_text FROM ${config.table_prefix}posts WHERE post_id = ?`, [postId])
    },

    updatePost(postId, postHtml) {
      return db.execute(`UPDATE ${config.table_prefix}posts SET post_text = ? WHERE post_id = ?`, [postHtml, postId])
    }
  }
}

const replaceUrlsInText = (text, originalUrls, newUrls) => {
  return originalUrls.reduce((result, url, i) => {
    return result.replace(url, newUrls[i] || url)
  }, text)
}

module.exports = (config, results) => {
  let updatedCount = 0
  const spinner = ora().start()

  return connect(config.db)
    .then((db) => {
      const q = queries(db, config)

      const updatePosts = results.map(({post_id, post_text, urls}) => _ => {
        let nextUrls = []

        return downloadFiles(urls, config)
          .then((convertedUrls) => {
            nextUrls = convertedUrls
            return q.updatePostText(post_id, replaceUrlsInText(post_text, urls, nextUrls))
          })
          .then(() => {
            return q.getPost(post_id)
          })
          .then(([rows]) => {
            let htmlPost = rows[0]
            if (htmlPost) {
              return q.updatePost(post_id, replaceUrlsInText(htmlPost.post_text, urls, nextUrls))
            }
          })
          .then(() => {
            updatedCount += 1
          })
      })

      return serialPromise(updatePosts)
    })
    .then((results) => {
      spinner.succeed(`${updatedCount} posts updated`)
    })
    .catch((err) => {
      spinner.fail(err)
    })
}
