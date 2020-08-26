#!/usr/bin/env node

let { testOnReal } = require('postcss-parser-tests')
let ciJobNumber = require('ci-job-number')
let postcss = require('postcss')

let scss = require('../')

if (ciJobNumber() === 1) {
  testOnReal(css =>
    postcss().process(css, {
      parser: scss,
      map: { annotation: false }
    })
  )
}
