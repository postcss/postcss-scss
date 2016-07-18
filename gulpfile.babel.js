import gulp from 'gulp';

gulp.task('clean', () => {
    let del = require('del');
    return del(['build/']);
});

// Build

gulp.task('compile', ['clean'], () => {
    let sourcemaps = require('gulp-sourcemaps');
    let babel      = require('gulp-babel');
    return gulp.src('lib/*.es6')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('lib'));
});

gulp.task('build:lib', ['compile'], () => {
    return gulp.src('lib/*.js').pipe(gulp.dest('build/lib'));
});

gulp.task('build:docs', ['clean'], () => {
    let ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['.npmignore'])
        .map( i => '!' + i );
    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:lib', 'build:docs']);

// Lint

gulp.task('lint', () => {
    if ( parseInt(process.versions.node) < 4 ) {
        return false;
    }
    let eslint = require('gulp-eslint');
    return gulp.src(['*.js', 'lib/*.es6', 'test/*.es6'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// Test

gulp.task('test', () => {
    let ava = require('gulp-ava');
    return gulp.src('test/*.es6', { read: false }).pipe(ava());
});

gulp.task('integration', done => {
    let postcss = require('postcss');
    let real    = require('postcss-parser-tests/real');
    let scss    = require('./');
    real(done, css => {
        return postcss().process(css, {
            parser: scss,
            map:    { annotation: false }
        });
    });
});

// Common

gulp.task('default', ['lint', 'test']);
