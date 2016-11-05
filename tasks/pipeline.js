

var cssFilesToInject = [
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
    'bower_components/select2/dist/css/select2.min.css',
    'styles/**/*.css',
];

// Client-side javascript files to inject in order
var jsFilesToInject = [
    // Load sails.io before everything else
    'js/dependencies/sails.io.js',

    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/bootstrap/dist/js/bootstrap.min.js',
    'bower_components/select2/dist/js/select2.full.min.js',
    'bower_components/jsrender.min.js',
    // Dependencies like jQuery, or Angular are brought in here
    'js/dependencies/**/*.js',

    // All of the rest of your client-side js files
    // will be injected here in no particular order.
    // 'js/**/*.js'
];


var templateFilesToInject = [
    'templates/**/*.html',

];



// Default path for public folder (see documentation for more information)
var tmpPath = '.tmp/public/';

// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function(cssPath) {
    // If we're ignoring the file, make sure the ! is at the beginning of the path
    if (cssPath[0] === '!') {
        return require('path').join('!.tmp/public/', cssPath.substr(1));
    }
    return require('path').join('.tmp/public/', cssPath);
});
module.exports.jsFilesToInject = jsFilesToInject.map(function(jsPath) {
    // If we're ignoring the file, make sure the ! is at the beginning of the path
    if (jsPath[0] === '!') {
        return require('path').join('!.tmp/public/', jsPath.substr(1));
    }
    return require('path').join('.tmp/public/', jsPath);
});
module.exports.templateFilesToInject = templateFilesToInject.map(function(tplPath) {
    // If we're ignoring the file, make sure the ! is at the beginning of the path
    if (tplPath[0] === '!') {
        return require('path').join('!assets/', tplPath.substr(1));
    }
    return require('path').join('assets/', tplPath);
});