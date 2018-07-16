const Input = require('postcss/lib/input')

const tokenizer = require('../lib/scss-tokenize')

function tokenize (css) {
  const processor = tokenizer(new Input(css))
  const tokens = []
  while (!processor.endOfFile()) {
    tokens.push(processor.nextToken())
  }
  return tokens
}

function run (css, tokens) {
  expect(tokenize(css)).toEqual(tokens)
}

it('tokenizes inline comments', () => {
  run('// a\n', [
    ['comment', '// a', 1, 1, 1, 4, 'inline'],
    ['space', '\n']
  ])
})

it('tokenizes inline comments with any new line', () => {
  run('// a\r\n', [
    ['comment', '// a', 1, 1, 1, 4, 'inline'],
    ['space', '\r\n']
  ])
})

it('tokenizes inline comments in end of file', () => {
  run('// a', [['comment', '// a', 1, 1, 1, 4, 'inline']])
})

it('tokenizes interpolation', () => {
  run('#{a\nb}', [['word', '#{a\nb}', 1, 1, 2, 2]])
})

it('tokenizes recursively interpolations', () => {
  run('#{#{#{}}}', [['word', '#{#{#{}}}', 1, 1, 1, 9]])
})

it('tokenizes multiline url()', () => {
  run('url(a\nb)', [
    ['word', 'url', 1, 1, 1, 3],
    ['brackets', '(a\nb)', 1, 4, 2, 2]
  ])
})
