#!/usr/bin/env node

let { testOnReal } = require('postcss-parser-tests')
let postcss = require('postcss')

let scss = require('../')

testOnReal(css =>
  postcss().process(css, {
    map: { annotation: false },
    parser: scss
  })
)
