const fs = require('fs')
const ora = require('ora')
const uniq = require('lodash/uniq')
const connect = require('./db/connect')

const PHOTOBUCKET_URL = '.photobucket.com'
const pattern = /(https?:\/\/\w+\.photobucket\.com[^\.*]*\.(?:gif|jpg|jpeg|png|html)(?:\.html)?)/g

const getUrl = (text) => text.match(pattern)

module.exports = (config) => {
  let foundUrls = 0
  let missed = []

  const spinner = ora('Getting matched posts').start()

  return connect(config.db)
    .then((db) => {
      return db.execute(`SELECT * from ${config.table_prefix}posts WHERE post_text LIKE ? ORDER BY post_id DESC`, [`%${PHOTOBUCKET_URL}%`])
    })
    .then(([rows]) => {
      return rows
        .map((row) => {
          let urls = getUrl(row.post_text)
          if (!urls) {
            missed.push(row.post_id)
          } else {
            let uniqUrls = uniq(urls)
            foundUrls += uniqUrls.length

            return {
              post_id: row.post_id,
              post_text: row.post_text,
              urls: uniqUrls,
            }
          }
        })
        .filter(f => f)
    })
    .then((results) => {
      spinner.text = 'Writing results'
      fs.writeFileSync('./results.json', JSON.stringify(results, null, 2), 'utf8')

      spinner.info(`Found ${foundUrls} urls in ${results.length} posts`)
      return results
    })
}
