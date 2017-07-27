const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const getAdapter = (adapter) => {
  switch (adapter) {
    case 'phpbb':
      return require('../adapters/phpbb/index.js')

    default:
      return false
  }
}

const run = (flags) => {
  flags.config = flags.config || process.cwd() + '/config.json'

  let config

  try {
    config = JSON.parse(fs.readFileSync(flags.config, 'UTF-8'))
  } catch (e) {
    console.error(e.message)
    return Promise.resolve()
  }

  const adapter = getAdapter(config.adapter)
  if (!adapter) return console.error('Please specify an adapter in config.json')

  return adapter(config)
}

module.exports = (input, flags) => {

  if (input === 'setup') {
    let src = path.join(__dirname, '..', 'config.sample.json')
    let target = process.cwd() + '/config.json'
    let args = [src, target]

    spawnSync('cp', args)
    return Promise.resolve()
  }

  return run(flags)
}
