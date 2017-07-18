const fs = require('fs')
const ora = require('ora')
const connect = require('./db/connect')

const PHOTOBUCKET_URL = '.photobucket.com'
const pattern = /(http:\/\/\w+\.photobucket\.com.*?\.(?:gif|jpg|jpeg|png|html|)*)/g

const getUrl = (text) => text.match(pattern)

module.exports = (config) => {
  let foundUrls = 0
  let missed = []

  const spinner = ora('Getting matched posts').start()
  let cachedResults = null

  try {
    cachedResults = JSON.parse(fs.readFileSync('../../results.json'))
  } catch (e) {}

  if (cachedResults) {
    spinner.succeed('Using cached results')
    return Promise.resolve(cachedResults)
  }

  return connect(config.db)
    .then((db) => {
      return db.execute(`SELECT * from ${config.table_prefix}posts_text WHERE post_text LIKE ? ORDER BY post_id DESC`, [`%${PHOTOBUCKET_URL}%`])
    })
    .then(([rows]) => {
      return rows
        .map((row) => {
          let urls = getUrl(row.post_text)
          if (!urls) {
            missed.push(row.post_id)
          } else {
            foundUrls += urls.length
            return {
              post_id: row.post_id,
              post_text: row.post_text,
              urls,
            }
          }
        })
        .filter(f => f)
    })
    .then((results) => {
      spinner.text = 'Writing results'
      fs.writeFileSync('./results.json', JSON.stringify(results, null, 2), 'utf8')

      spinner.succeed(`Found ${foundUrls} urls`)
      return results
    })
}
