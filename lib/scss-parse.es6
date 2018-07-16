const Input = require('postcss/lib/input')

const ScssParser = require('./scss-parser')

module.exports = function scssParse (scss, opts) {
  const input = new Input(scss, opts)

  const parser = new ScssParser(input)
  parser.parse()

  return parser.root
}
