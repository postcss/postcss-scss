let { eachTest } = require('postcss-parser-tests')
let { equal } = require('uvu/assert')
let { test } = require('uvu')

let stringify = require('../lib/scss-stringify')
let parse = require('../lib/scss-parse')

eachTest((name, css) => {
  if (name === 'bom.css') return

  test('stringifies ' + name, () => {
    let root = parse(css)
    let result = ''
    stringify(root, i => {
      result += i
    })
    equal(result, css)
  })
})

test('stringifies inline comment', () => {
  let root = parse('// comment\na {}')
  let result = ''
  stringify(root, i => {
    result += i
  })
  equal(result, '// comment\na {}')
})

test('stringifies inline comment with comments inside', () => {
  let root = parse('// a/*b*/c\na {}')
  let result = ''
  stringify(root, i => {
    result += i
  })
  equal(result, '// a/*b*/c\na {}')
})

test('stringifies inline comment inside selectors', () => {
  let root = parse('a\n// comment\nb {}')
  let result = ''
  stringify(root, i => {
    result += i
  })
  equal(result, 'a\n// comment\nb {}')
})

test('stringifies inline comment in the end of file', () => {
  let root = parse('// comment')
  let result = ''
  stringify(root, i => {
    result += i
  })
  equal(result, '// comment')
})

test('stringifies rule with usual props', () => {
  let root = parse('a { color: red; text-align: justify ; }')
  let result = ''
  stringify(root, i => {
    result += i
  })
  equal(result, 'a { color: red; text-align: justify ; }')
})

test('stringifies nested props', () => {
  let root = parse('a { \n margin : 0!important { left: 10px; }}')
  let result = ''
  stringify(root, i => {
    result += i
  })
  equal(result, 'a { \n margin : 0!important { left: 10px; }}')
})

test('stringifies nested props with more newlines', () => {
  let root = parse('a { \n margin : 0 !important \n { \n left: 10px; } \n}')
  let result = ''
  stringify(root, i => {
    result += i
  })
  equal(result, 'a { \n margin : 0 !important \n { \n left: 10px; } \n}')
})

test.run()
