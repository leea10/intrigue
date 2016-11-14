const gulp = require('gulp');
const util = require('gulp-util');
const rename = require('gulp-rename');

const jshint = require('gulp-jshint');
const jscs = require('gulp-jscs');
const babel = require('gulp-babel');
const less = require('gulp-less');

const lessGlob = './app/views/less/*.less';
const clientJsGlob = './app/client/*.js';
const serverJsGlob = ['./app/!(client)/*.js', './app/*.js'];

// Default task: runs all build tasks and sets up all file watchers
gulp.task('default', ['build-all', 'watch-all']);

// Combined watchers
gulp.task('watch-all', ['watch-css', 'watch-client-js', 'watch-server-js']);

// Combined builds
gulp.task('build-all', ['build-css', 'build-client-js', 'build-server-js']);

// Less compilation
gulp.task('watch-css', function() {
    gulp.watch(lessGlob, ['build-css']);
});

gulp.task('build-css', function() {
    return gulp.src(lessGlob)
        .pipe(less())
        .pipe(gulp.dest('./public/css'));
});

// Javascript compilation - client side tasks
gulp.task('watch-client-js', function() {
    gulp.watch(clientJsGlob, ['build-client-js']);
});

gulp.task('build-client-js', ['js-style-client' ,'js-lint-client'], function() {
    return gulp.src(clientJsGlob)
        .pipe(babel())
        .pipe(rename({
            suffix: '-compiled'
        }))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('js-lint-client', function() {
    return gulp.src(clientJsGlob)
        .pipe(jshint({
            esversion: 6
        }))
        .pipe(jshint.reporter('default'));
});

gulp.task('js-style-client', function() {
    return gulp.src(clientJsGlob, {base: './'})
        .pipe(jscs({
            configPath: './config.jscs',
            fix: true
        }))
        .pipe(jscs.reporter());
});

// Javascript compilation - server side tasks
gulp.task('watch-server-js', function() {
    return gulp.watch(serverJsGlob, ['js-lint-server']);
});

gulp.task('build-server-js', ['js-style-server', 'js-lint-server']);

gulp.task('js-lint-server', function() {
    return gulp.src(serverJsGlob)
        .pipe(jshint({
            esversion: 6
        }))
        .pipe(jshint.reporter('default'));
});

gulp.task('js-style-server', function() {
    return gulp.src(serverJsGlob, {base: './'})
        .pipe(jscs({
            configPath: './config.jscs',
            fix: true
        }))
        .pipe(jshint.reporter())
        .pipe(gulp.dest('./'));
});