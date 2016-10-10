const gulp = require('gulp');
const util = require('gulp-util');
const rename = require('gulp-rename');

const babel = require('gulp-babel');
const less = require('gulp-less');

const lessGlob = './app/views/less/*.less';
const clientJsGlob = './app/client/*.js';

// Default task: runs all build tasks and sets up all file watchers
gulp.task('default', ['build-all', 'watch-all']);

// Combined watchers
gulp.task('watch-all', ['watch-css', 'watch-client-js']);

// Combined builds
gulp.task('build-all', ['build-css', 'build-client-js']);

// Less compilation
gulp.task('watch-css', function() {
    gulp.watch(lessGlob, ['build-css']);
});

gulp.task('build-css', function() {
    return gulp.src(lessGlob)
        .pipe(less())
        .pipe(gulp.dest('./public/css'));
});

// Babel compilation - client side
gulp.task('watch-client-js', function() {
    gulp.watch(clientJsGlob, ['build-client-js']);
});

gulp.task('build-client-js', function() {
    return gulp.src(clientJsGlob)
        .pipe(babel())
        .pipe(rename({
            suffix: '-compiled'
        }))
        .pipe(gulp.dest('./public/js'));
});