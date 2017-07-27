const fs = require('fs')
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
  flags.config = flags.config || './config.json'

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
    spawnSync('cp', ['config.sample.json', 'config.json'])
    return Promise.resolve()
  }

  return run(flags)
}
