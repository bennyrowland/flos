/**
 * Created by ben on 19/01/16.
 */

var Gulp = require('gulp');
var Plugins = require('gulp-load-plugins')();
var Spawn = require('child_process').spawn;
var BowerFiles = require('main-bower-files');
var Es = require('event-stream');

var paths = {
    scripts: ['./frontend/**/*.js', './frontend/app.js'],
    scriptsDevServer: './backend/**/*.js',
    styles: './frontend/**/*.scss',
    appDev: './app/',
    appVendorDev: './app/bower_components',
    index: './frontend/index.html',
    partials: ['./frontend/**/*.html', '!./frontend/index.html']
};

var pipes = {};

pipes.validatedDevServerScripts = function () {
    return Gulp.src(paths.scriptsDevServer)
        .pipe(Plugins.jshint())
        .pipe(Plugins.jshint.reporter('jshint-stylish'));
};

pipes.validatedAppScripts = function () {
    return Gulp.src(paths.scripts)
        .pipe(Plugins.jshint())
        .pipe(Plugins.jshint.reporter('jshint-stylish'));
};

pipes.orderedAppScripts = function () {
    return Es.merge(pipes.validatedAppScripts(), pipes.compiledPartialsDev())
        .pipe(Plugins.angularFilesort());
};

pipes.builtAppScriptsDev = function () {
    return pipes.orderedAppScripts()
        .pipe(Gulp.dest(paths.appDev));
};

pipes.orderedVendorScripts = function () {
    return Gulp.src(BowerFiles())
        .pipe(Plugins.print())
        .pipe(Plugins.order(['angular.js']));
};

pipes.builtVendorScriptsDev = function () {
    return pipes.orderedVendorScripts()
        .pipe(Gulp.dest(paths.appVendorDev));
};

pipes.validatedPartials = function() {
    return Gulp.src(paths.partials)
        .pipe(Plugins.htmlhint({'doctype-first': false}))
        .pipe(Plugins.htmlhint.reporter());
};

pipes.compiledPartialsDev = function() {
    return pipes.validatedPartials()
        .pipe(Plugins.angularTemplatecache({module: 'graph'}))
        .pipe(Gulp.dest(paths.appDev));
};

pipes.validatedIndex = function () {
    return Gulp.src(paths.index)
        .pipe(Plugins.htmlhint())
        .pipe(Plugins.htmlhint.reporter());
};

pipes.builtStylesDev = function () {
    return Gulp.src(paths.styles)
        .pipe(Plugins.sass())
        .pipe(Gulp.dest(paths.appDev));
};

pipes.builtIndexDev = function () {
    return pipes.validatedIndex()
        .pipe(Gulp.dest(paths.appDev)) // write first to get relative path for inject
        .pipe(Plugins.inject(pipes.builtVendorScriptsDev(), {relative: true, name: 'bower'}))
        .pipe(Plugins.inject(pipes.builtAppScriptsDev(), {relative: true}))
        .pipe(Plugins.inject(pipes.builtStylesDev(), {relative: true}))
        .pipe(Gulp.dest(paths.appDev));
};

pipes.builtAppDev = function () {
    return Es.merge(pipes.builtIndexDev()); //, pipes.processedImagesDev());
};

Gulp.task('validate-devserver-scripts', pipes.validatedDevServerScripts);



Gulp.task('build-app-dev', pipes.builtAppDev);

Gulp.task('watch-dev', ['build-app-dev', 'validate-devserver-scripts'], function () {
    // start nodemon to auto-reload the dev server
    Plugins.nodemon({ script: 'index.js', ext: 'js', watch: ['backend/'], env: {NODE_ENV : 'development'} })
        .on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    Gulp.watch(paths.index, function () {
        pipes.builtAppDev();
    });

    Gulp.watch(paths.scripts, function() {
        console.log('rebuilding app due to changed scripts');
        pipes.builtAppDev();
    });

    Gulp.watch(paths.partials, function() {
        console.log('rebuilding app due to changed partials');
        pipes.builtAppDev();
    });

    Gulp.watch(paths.styles, function() {
        console.log('rebuilding app due to changed styles');
        pipes.builtAppDev();
    });
});