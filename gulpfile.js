'use strict'

const gulp = require('gulp')

gulp.task('clean', () => {
  const del = require('del')
  return del(['build/', 'lib/*.js'])
})

// Build

gulp.task('compile', () => {
  const sourcemaps = require('gulp-sourcemaps')
  const changed = require('gulp-changed')
  const babel = require('gulp-babel')
  return gulp.src('lib/*.es6')
    .pipe(changed('lib', { extension: '.js' }))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('lib'))
})

gulp.task('build:lib', ['compile'], () => {
  return gulp.src('lib/*.js').pipe(gulp.dest('build/lib'))
})

gulp.task('build:package', () => {
  const editor = require('gulp-json-editor')
  return gulp.src('./package.json')
    .pipe(editor(json => {
      delete json.babel
      delete json.scripts
      delete json.jest
      delete json.eslintConfig
      delete json['pre-commit']
      delete json['lint-staged']
      delete json.devDependencies
      return json
    }))
    .pipe(gulp.dest('build'))
})

gulp.task('build:docs', () => {
  const ignore = require('fs').readFileSync('.npmignore').toString()
    .trim().split(/\n+/)
    .concat(['.npmignore', 'package.json'])
    .map(i => '!' + i)
  return gulp.src(['*'].concat(ignore))
    .pipe(gulp.dest('build'))
})

gulp.task('build', done => {
  const runSequence = require('run-sequence')
  runSequence('clean', ['build:lib', 'build:docs', 'build:package'], done)
})

// Lint

gulp.task('lint', ['compile'], () => {
  const eslint = require('gulp-eslint')
  return gulp.src(['*.js', 'lib/*.es6', 'test/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

// Test

gulp.task('test', ['compile'], () => {
  const jest = require('gulp-jest').default
  return gulp.src('test/').pipe(jest())
})

gulp.task('integration', ['compile'], done => {
  const postcss = require('postcss')
  const real = require('postcss-parser-tests/real')
  const scss = require('./')
  real(done, css => {
    return postcss().process(css, {
      parser: scss,
      map: { annotation: false }
    })
  })
})

// Common

gulp.task('default', ['lint', 'test', 'integration'])
