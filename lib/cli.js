const getAdapter = (adapter) => {
  switch (adapter) {
    case 'phpbb':
      return require('../adapters/phpbb/index.js')

    default:
      return false
  }
}

const run = (flags) => {
  const config = require('../config.json')

  const adapter = getAdapter(config.adapter)
  if (!adapter) return console.error('Please specify an adapter in config.json')

  return adapter(config)
}

module.exports = (input, flags) => {
  return run(flags)
}
