const ScssStringifier = require('./scss-stringifier')

module.exports = function scssStringify (node, builder) {
  const str = new ScssStringifier(builder)
  str.stringify(node)
}
