let { equal } = require('uvu/assert')
let { test } = require('uvu')

let parse = require('../lib/scss-parse')

function checkOffset(source, node, expected) {
  let start = node.source.start.offset
  let end = node.source.end.offset
  equal(source.slice(start, end), expected)
}

test('inline comment', () => {
  let source = 'a{//xxx\n}'
  let root = parse(source)

  checkOffset(source, root.first, 'a{//xxx\n}')
  checkOffset(source, root.first.first, '//xxx')
})

test('nested prop with value', () => {
  let source = 'a { margin: 0 { left: 10px; }}'
  let root = parse(source)

  checkOffset(source, root.first, 'a { margin: 0 { left: 10px; }}')
  checkOffset(source, root.first.first, 'margin: 0 { left: 10px; }')
  checkOffset(source, root.first.first.first, 'left: 10px;')
})

test.run()
