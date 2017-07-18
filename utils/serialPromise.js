module.exports = (promises) => {
  return promises.reduce((p, next) => {
    return p.then(next, next)
  }, Promise.resolve())
}
