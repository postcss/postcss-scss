let { eachTest, jsonify } = require('postcss-parser-tests')
let { equal } = require('uvu/assert')
let { test } = require('uvu')

let parse = require('../lib/scss-parse')

eachTest((name, css, json) => {
  test('parses ' + name, () => {
    let parsed = jsonify(parse(css, { from: name }))
    equal(parsed, json)
  })
})

test('parses nested rules', () => {
  let root = parse('a { b {} }')
  equal(root.first.first.selector, 'b')

  equal(root.first.first.source.start.line, 1)
  equal(root.first.first.source.start.column, 5)
  equal(root.first.first.source.end.line, 1)
  equal(root.first.first.source.end.column, 8)
})

test('parses at-rules inside rules', () => {
  let root = parse('a { @media {} }')
  equal(root.first.first.name, 'media')
})

test('parses variables', () => {
  let root = parse('$var: 1;')
  equal(root.first.prop, '$var')
  equal(root.first.value, '1')
})

test('parses inline comments', () => {
  let root = parse('\n// a \n/* b */')
  equal(root.nodes.length, 2)
  equal(root.first.text, 'a')
  equal(root.first.raws, {
    before: '\n',
    inline: true,
    left: ' ',
    right: ' ',
    text: 'a'
  })
  equal(root.last.text, 'b')
})

test('parses empty inline comments', () => {
  let root = parse('//\n// ')
  equal(root.first.text, '')
  equal(root.first.raws, {
    before: '',
    inline: true,
    left: '',
    right: ''
  })
  equal(root.last.text, '')
  equal(root.last.raws, {
    before: '\n',
    inline: true,
    left: ' ',
    right: ''
  })
})

test('parses inline comments inside selector', () => {
  let root = parse('a\n// c/**/\nb { }')
  equal(root.first.raws.selector.scss, 'a\n// c/**/\nb')
  equal(root.first.raws.selector.raw, 'a\n/* c*//**//**/\nb')
})

test('does not parse comments inside brackets', () => {
  let root = parse('a { cursor: url(http://ya.ru) }')
  equal(root.first.first.value, 'url(http://ya.ru)')
})

test('does not parse comments inside brackets and spaces', () => {
  let root = parse('a { cursor: url( http://ya.ru ) }')
  equal(root.first.first.value, 'url( http://ya.ru )')
})

test('parses interpolation', () => {
  let root = parse('#{$selector}:hover { #{$prop}-size: #{$color} }')
  equal(root.first.selector, '#{$selector}:hover')
  equal(root.first.first.prop, '#{$prop}-size')
  equal(root.first.first.value, '#{$color}')
})

test('parses interpolation inside word', () => {
  let root = parse('.#{class} {}')
  equal(root.first.selector, '.#{class}')
})

test('parses non-interpolation', () => {
  let root = parse('\\#{ color: black }')
  equal(root.first.selector, '\\#')
})

test('parses interpolation inside interpolation', () => {
  let root = parse('$column: #{"#{&}__column"};')
  equal(root.first.value, '#{"#{&}__column"}')
})

test("parses interpolation that's the entire at-rule", () => {
  let root = parse('@#{$var} param { }')
  equal(root.first.name, '#{$var}')
  equal(root.first.params, 'param')
})

test('parses interpolation at the beginning of at-rule', () => {
  let root = parse('@#{$var}suffix param { }')
  equal(root.first.name, '#{$var}suffix')
  equal(root.first.params, 'param')
})

test('parses interpolation within at-rule', () => {
  let root = parse('@before#{$var}after param { }')
  equal(root.first.name, 'before#{$var}after')
  equal(root.first.params, 'param')
})

test('parses interpolation right after at-rule', () => {
  let root = parse('@media#{$var} { }')
  equal(root.first.name, 'media#{$var}')
  equal(root.first.params, '')
})

test('parses interpolation in at-rule value', () => {
  let root = parse('@media #{$var} { }')
  equal(root.first.name, 'media')
  equal(root.first.params, '#{$var}')
})

test('parses interpolation in url()', () => {
  let root = parse('image: url(#{get(path)}.png)')
  equal(root.first.value, 'url(#{get(path)}.png)')
})

test('parses text in rules', () => {
  let root = parse('a { margin:text { left: 10px; }}')
  equal(root.first.first.selector, 'margin:text')
  equal(root.first.first.first.prop, 'left')
})

test('parses semicolon in rules', () => {
  let root = parse('a { test(a: 1) { left: 10px; }}')
  equal(root.first.first.selector, 'test(a: 1)')
  equal(root.first.first.first.prop, 'left')
})

test('parsers prefixed pseudo in rules', () => {
  let root = parse('input:-moz-focusring { left: 1px }')
  equal(root.first.selector, 'input:-moz-focusring')
  equal(root.first.first.prop, 'left')
})

test('parses nested props as rule', () => {
  let root = parse('a { margin: { left: 10px; }}')
  equal(root.first.first.selector, 'margin:')
  equal(root.first.first.first.prop, 'left')

  equal(root.first.first.source.start.line, 1)
  equal(root.first.first.source.start.column, 5)
  equal(root.first.first.source.end.line, 1)
  equal(root.first.first.source.end.column, 27)
})

test('parses nested props with value', () => {
  let root = parse('a { margin: 0 { left: 10px; }}')

  equal(root.first.first.prop, 'margin')
  equal(root.first.first.value, '0')
  equal(root.first.first.raws.between, ': ')

  equal(root.first.first.first.prop, 'left')
  equal(root.first.first.first.value, '10px')

  equal(root.first.first.source.start.line, 1)
  equal(root.first.first.source.start.column, 5)
  equal(root.first.first.source.end.line, 1)
  equal(root.first.first.source.end.column, 29)
})

test('parses nested props with space-less digit', () => {
  let root = parse('a { margin:0 { left: 10px; }}')
  equal(root.first.first.prop, 'margin')
  equal(root.first.first.value, '0')
  equal(root.first.first.first.prop, 'left')

  equal(root.first.first.source.start.line, 1)
  equal(root.first.first.source.start.column, 5)
  equal(root.first.first.source.end.line, 1)
  equal(root.first.first.source.end.column, 28)
})

test('parses nested props with new line as rule', () => {
  let root = parse('a { \n margin  \n:0 { left: 10px; }}')
  equal(root.first.first.selector, 'margin  \n:0')

  equal(root.first.first.source.start.line, 2)
  equal(root.first.first.source.start.column, 2)
  equal(root.first.first.source.end.line, 3)
  equal(root.first.first.source.end.column, 18)
})

test('parses nested props with important', () => {
  let root = parse('a { margin: 0!important { left: 10px; }}')
  equal(root.first.first.prop, 'margin')
  equal(root.first.first.value, '0')
  equal(root.first.first.important, true)

  equal(root.first.first.source.start.line, 1)
  equal(root.first.first.source.start.column, 5)
  equal(root.first.first.source.end.line, 1)
  equal(root.first.first.source.end.column, 39)
})

test('parses interpolation with variable', () => {
  let root = parse('&:#{$var} {}')
  equal(root.first.selector, '&:#{$var}')
})

test('parses comment inside comment', () => {
  let root = parse('a {\n//a/*b*/c\n}')
  equal(root.toString(), 'a {\n/*a*//*b*//*c*/\n}')
})

test('parses complex interpolation', () => {
  let root = parse('content: #{fn("\\"}")};')
  equal(root.first.value, '#{fn("\\"}")}')
})

test('parses interpolation inside string', () => {
  let root = parse('content: "#{fn("\\"}")}";')
  equal(root.first.value, '"#{fn("\\"}")}"')
})

test.run()
