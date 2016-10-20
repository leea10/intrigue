const gulp = require('gulp');
const util = require('gulp-util');
const rename = require('gulp-rename');

const jslint = require('gulp-jslint');
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

gulp.task('build-client-js', ['js-lint-client'], function() {
    return gulp.src(clientJsGlob)
        .pipe(babel())
        .pipe(rename({
            suffix: '-compiled'
        }))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('js-lint-client', function() {
    return gulp.src(clientJsGlob)
        .pipe(jslint({
            es6: true
        }))
        .pipe(jslint.reporter('stylish'));
});

// Javascript compilation - server side tasks
gulp.task('watch-server-js', function() {
    return gulp.watch(serverJsGlob, ['js-lint-server']);
});

gulp.task('build-server-js', ['js-lint-server']);

gulp.task('js-lint-server', function() {
    return gulp.src(serverJsGlob)
        .pipe(jslint({
            es6: true,
            node: true
        }))
        .pipe(jslint.reporter('stylish'));
});