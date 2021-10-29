let { eachTest, jsonify } = require('postcss-parser-tests')

let parse = require('../lib/scss-parse')

eachTest((name, css, json) => {
  it('parses ' + name, () => {
    let parsed = jsonify(parse(css, { from: name }))
    expect(parsed).toEqual(json)
  })
})

it('parses nested rules', () => {
  let root = parse('a { b {} }')
  expect(root.first.first.selector).toBe('b')

  expect(root.first.first.source.start.line).toBe(1)
  expect(root.first.first.source.start.column).toBe(5)
  expect(root.first.first.source.end.line).toBe(1)
  expect(root.first.first.source.end.column).toBe(8)
})

it('parses at-rules inside rules', () => {
  let root = parse('a { @media {} }')
  expect(root.first.first.name).toBe('media')
})

it('parses variables', () => {
  let root = parse('$var: 1;')
  expect(root.first.prop).toBe('$var')
  expect(root.first.value).toBe('1')
})

it('parses inline comments', () => {
  let root = parse('\n// a \n/* b */')
  expect(root.nodes).toHaveLength(2)
  expect(root.first.text).toBe('a')
  expect(root.first.raws).toEqual({
    before: '\n',
    left: ' ',
    right: ' ',
    inline: true,
    text: 'a'
  })
  expect(root.last.text).toBe('b')
})

it('parses empty inline comments', () => {
  let root = parse('//\n// ')
  expect(root.first.text).toBe('')
  expect(root.first.raws).toEqual({
    before: '',
    left: '',
    right: '',
    inline: true
  })
  expect(root.last.text).toBe('')
  expect(root.last.raws).toEqual({
    before: '\n',
    left: ' ',
    right: '',
    inline: true
  })
})

it('parses inline comments inside selector', () => {
  let root = parse('a\n// c/**/\nb { }')
  expect(root.first.raws.selector.scss).toBe('a\n// c/**/\nb')
  expect(root.first.raws.selector.raw).toBe('a\n/* c*//**//**/\nb')
})

it('does not parse comments inside brackets', () => {
  let root = parse('a { cursor: url(http://ya.ru) }')
  expect(root.first.first.value).toBe('url(http://ya.ru)')
})

it('does not parse comments inside brackets and spaces', () => {
  let root = parse('a { cursor: url( http://ya.ru ) }')
  expect(root.first.first.value).toBe('url( http://ya.ru )')
})

it('parses interpolation', () => {
  let root = parse('#{$selector}:hover { #{$prop}-size: #{$color} }')
  expect(root.first.selector).toBe('#{$selector}:hover')
  expect(root.first.first.prop).toBe('#{$prop}-size')
  expect(root.first.first.value).toBe('#{$color}')
})

it('parses interpolation inside word', () => {
  let root = parse('.#{class} {}')
  expect(root.first.selector).toBe('.#{class}')
})

it('parses non-interpolation', () => {
  let root = parse('\\#{ color: black }')
  expect(root.first.selector).toBe('\\#')
})

it('parses interpolation inside interpolation', () => {
  let root = parse('$column: #{"#{&}__column"};')
  expect(root.first.value).toBe('#{"#{&}__column"}')
})

it("parses interpolation that's the entire at-rule", () => {
  let root = parse('@#{$var} param { }')
  expect(root.first.name).toBe('#{$var}')
  expect(root.first.params).toBe('param')
})

it('parses interpolation at the beginning of at-rule', () => {
  let root = parse('@#{$var}suffix param { }')
  expect(root.first.name).toBe('#{$var}suffix')
  expect(root.first.params).toBe('param')
})

it('parses interpolation within at-rule', () => {
  let root = parse('@before#{$var}after param { }')
  expect(root.first.name).toBe('before#{$var}after')
  expect(root.first.params).toBe('param')
})

it('parses interpolation right after at-rule', () => {
  let root = parse('@media#{$var} { }')
  expect(root.first.name).toBe('media#{$var}')
  expect(root.first.params).toBe('')
})

it('parses interpolation in at-rule value', () => {
  let root = parse('@media #{$var} { }')
  expect(root.first.name).toBe('media')
  expect(root.first.params).toBe('#{$var}')
})

it('parses interpolation in url()', () => {
  let root = parse('image: url(#{get(path)}.png)')
  expect(root.first.value).toBe('url(#{get(path)}.png)')
})

it('parses text in rules', () => {
  let root = parse('a { margin:text { left: 10px; }}')
  expect(root.first.first.selector).toBe('margin:text')
  expect(root.first.first.first.prop).toBe('left')
})

it('parses semicolon in rules', () => {
  let root = parse('a { test(a: 1) { left: 10px; }}')
  expect(root.first.first.selector).toBe('test(a: 1)')
  expect(root.first.first.first.prop).toBe('left')
})

it('parsers prefixed pseudo in rules', () => {
  let root = parse('input:-moz-focusring { left: 1px }')
  expect(root.first.selector).toBe('input:-moz-focusring')
  expect(root.first.first.prop).toBe('left')
})

it('parses nested props as rule', () => {
  let root = parse('a { margin: { left: 10px; }}')
  expect(root.first.first.selector).toBe('margin:')
  expect(root.first.first.first.prop).toBe('left')

  expect(root.first.first.source.start.line).toBe(1)
  expect(root.first.first.source.start.column).toBe(5)
  expect(root.first.first.source.end.line).toBe(1)
  expect(root.first.first.source.end.column).toBe(27)
})

it('parses nested props with value', () => {
  let root = parse('a { margin: 0 { left: 10px; }}')

  expect(root.first.first.prop).toBe('margin')
  expect(root.first.first.value).toBe('0')
  expect(root.first.first.raws.between).toBe(': ')

  expect(root.first.first.first.prop).toBe('left')
  expect(root.first.first.first.value).toBe('10px')

  expect(root.first.first.source.start.line).toBe(1)
  expect(root.first.first.source.start.column).toBe(5)
  expect(root.first.first.source.end.line).toBe(1)
  expect(root.first.first.source.end.column).toBe(29)
})

it('parses nested props with space-less digit', () => {
  let root = parse('a { margin:0 { left: 10px; }}')
  expect(root.first.first.prop).toBe('margin')
  expect(root.first.first.value).toBe('0')
  expect(root.first.first.first.prop).toBe('left')

  expect(root.first.first.source.start.line).toBe(1)
  expect(root.first.first.source.start.column).toBe(5)
  expect(root.first.first.source.end.line).toBe(1)
  expect(root.first.first.source.end.column).toBe(28)
})

it('parses nested props with new line as rule', () => {
  let root = parse('a { \n margin  \n:0 { left: 10px; }}')
  expect(root.first.first.selector).toBe('margin  \n:0')

  expect(root.first.first.source.start.line).toBe(2)
  expect(root.first.first.source.start.column).toBe(2)
  expect(root.first.first.source.end.line).toBe(3)
  expect(root.first.first.source.end.column).toBe(18)
})

it('parses nested props with important', () => {
  let root = parse('a { margin: 0!important { left: 10px; }}')
  expect(root.first.first.prop).toBe('margin')
  expect(root.first.first.value).toBe('0')
  expect(root.first.first.important).toBe(true)

  expect(root.first.first.source.start.line).toBe(1)
  expect(root.first.first.source.start.column).toBe(5)
  expect(root.first.first.source.end.line).toBe(1)
  expect(root.first.first.source.end.column).toBe(39)
})

it('parses interpolation with variable', () => {
  let root = parse('&:#{$var} {}')
  expect(root.first.selector).toBe('&:#{$var}')
})

it('parses comment inside comment', () => {
  let root = parse('a {\n//a/*b*/c\n}')
  expect(root.toString()).toBe('a {\n/*a*//*b*//*c*/\n}')
})

it('parses complex interpolation', () => {
  let root = parse('content: #{fn("\\"}")};')
  expect(root.first.value).toBe('#{fn("\\"}")}')
})

it('parses interpolation inside string', () => {
  let root = parse('content: "#{fn("\\"}")}";')
  expect(root.first.value).toBe('"#{fn("\\"}")}"')
})
