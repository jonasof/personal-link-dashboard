'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var plumber = require('gulp-plumber');
var jetpack = require('fs-jetpack');
var bundle = require('./bundle');
var utils = require('./utils');

var projectDir = jetpack;
var srcDir = jetpack.cwd('./src');
var destDir = jetpack.cwd('./app');
var nodeDir = jetpack.cwd('./node_modules');

gulp.task('bundle', function () {
    return Promise.all([
        bundle(srcDir.path('background.js'), destDir.path('background.js')),
        bundle(srcDir.path('app.js'), destDir.path('app.js')),
    ]);
});

gulp.task('scss', function () {
    return gulp.src(srcDir.path('stylesheets/main.scss'))
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulp.dest(destDir.path('stylesheets')));
});

gulp.task('libs', function () {
    return gulp.src(nodeDir.path('font-awesome/fonts/**.*'))
        .pipe(gulp.dest(destDir.path('fonts')));
});

gulp.task('environment', function () {
    var configFile = 'config/env_' + utils.getEnvName() + '.json';
    projectDir.copy(configFile, destDir.path('env.json'), { overwrite: true });
});

gulp.task('watch', function () {
    var beepOnError = function (done) {
        return function (err) {
            if (err) {
                utils.beepSound();
            }
            done(err);
        };
    };

    watch('src/**/*.js', batch(function (events, done) {
        gulp.start('bundle', beepOnError(done));
    }));
    watch('src/**/*.scss', batch(function (events, done) {
        gulp.start('scss', beepOnError(done));
    }));
});

gulp.task('build', ['bundle', 'scss', 'libs', 'environment']);
