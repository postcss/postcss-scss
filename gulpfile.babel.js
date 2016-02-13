import gulp from 'gulp';

gulp.task('clean', () => {
    let del = require('del');
    return del(['build/']);
});

// Build

gulp.task('build:lib', ['clean'], () => {
    let babel = require('gulp-babel');
    return gulp.src('lib/*.es6')
        .pipe(babel())
        .pipe(gulp.dest('build/lib'));
});

gulp.task('build:docs', ['clean'], () => {
    let ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['.npmignore', 'package.json', 'index.js'])
        .map( i => '!' + i );
    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', ['clean'], () => {
    let editor = require('gulp-json-editor');
    let builders = [
        'babel-plugin-add-module-exports',
        'babel-preset-es2015-loose',
        'babel-preset-stage-0',
        'babel-core'
    ];
    gulp.src('./package.json')
        .pipe(editor( json => {
            json.main = 'lib/scss-syntax';
            for ( let i of builders ) {
                json.devDependencies[i] = json.dependencies[i];
                delete json.dependencies[i];
            }
            return json;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:lib', 'build:docs', 'build:package']);

// Lint

gulp.task('lint', () => {
    let eslint = require('gulp-eslint');
    return gulp.src(['*.js', 'lib/*.es6', 'test/*.es6'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// Test

gulp.task('test', () => {
    require('babel-core/register')({ extensions: ['.es6'], ignore: false });
    let mocha = require('gulp-mocha');
    return gulp.src('test/*.es6', { read: false }).pipe(mocha());
});

gulp.task('integration', done => {
    require('babel-core/register')({ extensions: ['.es6'], ignore: false });
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
