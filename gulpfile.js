'use strict'

let gulp = require('gulp')

gulp.task('clean', () => {
  let del = require('del')
  return del(['build/', 'lib/*.js'])
})

// Build

gulp.task('compile', () => {
  let sourcemaps = require('gulp-sourcemaps')
  let changed = require('gulp-changed')
  let babel = require('gulp-babel')
  return gulp.src('lib/*.es6')
    .pipe(changed('lib', { extension: '.js' }))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('lib'))
})

gulp.task('build:lib', gulp.series('compile', () => {
  return gulp.src('lib/*.js').pipe(gulp.dest('build/lib'))
}))

gulp.task('build:package', () => {
  let editor = require('gulp-json-editor')
  return gulp.src('./package.json')
    .pipe(editor(json => {
      delete json.babel
      delete json.scripts
      delete json.jest
      delete json.eslintConfig
      delete json['pre-commit']
      delete json['lint-staged']
      delete json.browserslist
      delete json.devDependencies
      return json
    }))
    .pipe(gulp.dest('build'))
})

gulp.task('build:types', () => {
  return gulp.src(['lib/*.d.ts'])
    .pipe(gulp.dest('build/lib'))
})

gulp.task('build:docs', () => {
  let ignore = require('fs').readFileSync('.npmignore').toString()
    .trim().split(/\n+/)
    .concat(['.npmignore', 'package.json'])
    .map(i => '!' + i)
  return gulp.src(['*'].concat(ignore))
    .pipe(gulp.dest('build'))
})

gulp.task('build', gulp.series('compile',
  gulp.parallel('build:lib', 'build:docs', 'build:package', 'build:types')
))

// Test

gulp.task('test', gulp.series('compile', () => {
  let jest = require('gulp-jest').default
  return gulp.src('test/').pipe(jest())
}))

gulp.task('integration', gulp.series('compile', done => {
  let postcss = require('postcss')
  let real = require('postcss-parser-tests/real')
  let scss = require('./')
  real(done, css => {
    return postcss().process(css, {
      parser: scss,
      map: { annotation: false }
    })
  })
}))

// Common

gulp.task('default', gulp.parallel('test', 'integration'))
