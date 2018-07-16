const cases = require('postcss-parser-tests')

const stringify = require('../lib/scss-stringify')
const parse = require('../lib/scss-parse')

cases.each((name, css) => {
  if (name === 'bom.css') return

  it('stringifies ' + name, () => {
    const root = parse(css)
    let result = ''
    stringify(root, i => {
      result += i
    })
    expect(result).toEqual(css)
  })
})

it('stringifies inline comment', () => {
  const root = parse('// comment\na {}')
  let result = ''
  stringify(root, i => {
    result += i
  })
  expect(result).toEqual('// comment\na {}')
})

it('stringifies inline comment with comments inside', () => {
  const root = parse('// a/*b*/c\na {}')
  let result = ''
  stringify(root, i => {
    result += i
  })
  expect(result).toEqual('// a/*b*/c\na {}')
})

it('stringifies inline comment inside selectors', () => {
  const root = parse('a\n// comment\nb {}')
  let result = ''
  stringify(root, i => {
    result += i
  })
  expect(result).toEqual('a\n// comment\nb {}')
})

it('stringifies inline comment in the end of file', () => {
  const root = parse('// comment')
  let result = ''
  stringify(root, i => {
    result += i
  })
  expect(result).toEqual('// comment')
})

it('stringifies rule with usual props', () => {
  const root = parse('a { color: red; text-align: justify ; }')
  let result = ''
  stringify(root, i => {
    result += i
  })
  expect(result).toEqual('a { color: red; text-align: justify ; }')
})

it('stringifies nested props', () => {
  const root = parse('a { \n margin : 0!important { left: 10px; }}')
  let result = ''
  stringify(root, i => {
    result += i
  })
  expect(result).toEqual('a { \n margin : 0!important { left: 10px; }}')
})

it('stringifies nested props with more newlines', () => {
  const root = parse('a { \n margin : 0 !important \n { \n left: 10px; } \n}')
  let result = ''
  stringify(root, i => {
    result += i
  })
  expect(result).toEqual(
    'a { \n margin : 0 !important \n { \n left: 10px; } \n}')
})
