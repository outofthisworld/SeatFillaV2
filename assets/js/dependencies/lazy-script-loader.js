/*
    Lazily loads scripts,
    used in files that are returning via AJAX
    with script elements in them as synchronous AJAX has been depreciated

    Created by Dale
*/

$(window).ready(function() {
    (function($) {
        if (!$) throw new Error('Jquery not defined')

        $.lazyLoadExternalFiles = function(paths, options, done) {
            if (!paths || !(typeof paths == 'object')) return

            options = options || {};

            for (var key in paths) {
                if (key.indexOf('.css') != -1) {
                    var obj = {
                        href: key,
                        rel: 'stylesheet'
                    }
                    const link = $('<link></link>', obj)
                    if (paths[key] && typeof paths[key] == 'object') {
                        obj = Object.assign(obj, paths[key])
                    }
                    console.log(link)
                    $('head').append(link)
                } else if (key.indexOf('js') != -1 && (!options.sync)) {

                    // If this already exists continue
                    if ($('script[href="' + key + '"]').length)
                        continue

                    const object = {
                        src: key,
                        type: 'text/javascript'
                    }
                    const script = $('<script>', object)

                    if (paths[key] && typeof paths[key] == 'object') {
                        Object.extend(object, paths[key])
                    }
                    console.log('appending script to head: ' + script.html())
                    $('head').append(script)
                }
            }

            if (options && options.sync) {
                const objKeys = Object.keys(paths)

                function loadSync(scriptIndx) {
                    if (scriptIndx == objKeys.length) return
                    if (objKeys[scriptIndx].indexOf('js') == -1) return loadSync(++scriptIndx)

                    if ($('script[href="' + objKeys[scriptIndx] + '"]').length)
                        loadSync(++scriptIndx)

                    $.getScript(objKeys[scriptIndx], function() {
                        console.log('loaded script: ' + objKeys[scriptIndx])
                        if (scriptIndx == objKeys.length - 1)
                            return done && typeof done === 'function' ? done() : true
                        return loadSync(++scriptIndx)
                    })
                }
                loadSync(0)
            } else {
                return done && typeof done === 'function' ? done() : true
            }
        }

        $.getPageScripts = function(options) {
            if (!options) throw new Error('Invalid params to $.getPageScripts');

            const obj = {}
            $((options.elementType || 'div') + '[' + options.searchAttr + ']').each(function() {
                const src = $(this).attr(options.jsSrcAttr)
                const href = $(this).attr(options.cssHrefAttr)
                if (src)
                    obj[src] = true
                if (href)
                    obj[href] = true
            })
            return obj
        }

        $.loadScripts = function(getScriptOpts, lazyLoadOpts, done) {
            if (!getScriptOpts) throw new Error('Invalid params to $.loadScripts')
            $.lazyLoadExternalFiles($.getPageScripts(getScriptOpts), lazyLoadOpts || {}, done)
        }


        $.lazyLoadScriptsAsynchronous = function(options, done) {
            options = options || {}
            $.loadScripts({
                elementType: options.elementType || ' div',
                searchAttr: options.searchAttr || 'data-attr-lazyload',
                jsSrcAttr: options.jsSrcAttr || 'data-attr-src',
                cssHrefAttr: options.cssHrefAttr || 'data-attr-href'
            }, {}, done)
        }

        $.lazyLoadScriptsSynchronous = function(options, done) {
            options = options || {};
            $.loadScripts({
                elementType: options.elementType || ' div',
                searchAttr: options.searchAttr || 'data-attr-lazyload-sync',
                jsSrcAttr: options.jsSrcAttr || 'data-attr-src',
                cssHrefAttr: options.cssHrefAttr || 'data-attr-href'
            }, {
                sync: true
            }, done)
        }

        $.lazyLoadScripts = function(options, done) {
            Promise.all([
                new Promise(function(resolve, reject) {
                    $.lazyLoadScriptsAsynchronous(options, function() {
                        resolve()
                    })
                }),
                new Promise(function(resolve, reject) {
                    $.lazyLoadScriptsSynchronous(options, function() {
                        resolve()
                    })
                })
            ]).then(function(results) {
                done()
            }).catch(function(err) {
                done(err)
            })
        }
    })(window.$)
})