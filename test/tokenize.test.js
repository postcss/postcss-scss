let { equal } = require('uvu/assert')
let { Input } = require('postcss')
let { test } = require('uvu')

let tokenizer = require('../lib/scss-tokenize')

function tokenize(css) {
  let processor = tokenizer(new Input(css))
  let tokens = []
  while (!processor.endOfFile()) {
    tokens.push(processor.nextToken())
  }
  return tokens
}

function run(css, tokens) {
  equal(tokenize(css), tokens)
}

test('tokenizes inline comments', () => {
  run('// a\n', [
    ['comment', '// a', 0, 3, 'inline'],
    ['space', '\n']
  ])
})

test('tokenizes inline comments with any new line', () => {
  run('// a\r\n', [
    ['comment', '// a', 0, 3, 'inline'],
    ['space', '\r\n']
  ])
})

test('tokenizes inline comments in end of file', () => {
  run('// a', [['comment', '// a', 0, 3, 'inline']])
})

test('tokenizes interpolation', () => {
  run('#{a\nb}', [['word', '#{a\nb}', 0, 5]])
})

test('tokenizes interpolation with escaped brace', () => {
  run('#{"\\}"}', [['word', '#{"\\}"}', 0, 6]])
})

test('tokenizes interpolation with escaped quote', () => {
  run('#{"\\""}', [['word', '#{"\\""}', 0, 6]])
})

test('tokenizes interpolation with escaped backslash', () => {
  run('#{"\\\\"}', [['word', '#{"\\\\"}', 0, 6]])
})

test('tokenizes recursively interpolations', () => {
  run('#{#{#{}}}', [['word', '#{#{#{}}}', 0, 8]])
})

test('tokenizes multiline url()', () => {
  run('url(a\nb)', [
    ['word', 'url', 0, 2],
    ['brackets', '(a\nb)', 3, 7]
  ])
})

test.run()
