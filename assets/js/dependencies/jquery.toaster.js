/*
    Plugin to show status messages using twitter bootstrap.

    Visualisation of system status.
*/
(function() {
    if (typeof Array.prototype.indexOf !== 'function') {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            for (var i = (fromIndex || 0), j = this.length; i < j; i += 1) {
                if ((searchElement === undefined) || (searchElement === null)) {
                    if (this[i] === searchElement) {
                        return i;
                    }
                } else if (this[i] === searchElement) {
                    return i;
                }
            }
            return -1;
        };
    }
})();
(function($, undefined) {
    var toasting = {
        gettoaster: function() {
            var toaster = $('#' + settings.toaster.id);

            if (toaster.length < 1) {
                toaster = $(settings.toaster.template).attr('id', settings.toaster.id).css(settings.toaster.css).addClass(settings.toaster['class']);

                if ((settings.stylesheet) && (!$("link[href=" + settings.stylesheet + "]").length)) {
                    $('head').appendTo('<link rel="stylesheet" href="' + settings.stylesheet + '">');
                }

                $(settings.toaster.container).append(toaster);
            }

            return toaster;
        },

        notify: function(title, message, priority) {
            var $toaster = this.gettoaster();
            var $toast = $(settings.toast.template.replace('%priority%', priority)).hide().css(settings.toast.css).addClass(settings.toast['class']);

            $('.title', $toast).css(settings.toast.csst).html(title);
            $('.message', $toast).css(settings.toast.cssm).html(message);

            if ((settings.debug) && (window.console)) {
                console.log(toast);
            }

            $toaster.append(settings.toast.display($toast));

            if (settings.donotdismiss.indexOf(priority) === -1) {
                var timeout = (typeof settings.timeout === 'number') ? settings.timeout : ((typeof settings.timeout === 'object') && (priority in settings.timeout)) ? settings.timeout[priority] : 1500;
                setTimeout(function() {
                    settings.toast.remove($toast, function() {
                        $toast.remove();
                    });
                }, timeout);
            }
        }
    };

    var defaults = {
        'toaster': {
            'id': 'toaster',
            'container': 'body',
            'template': '<div></div>',
            'class': 'toaster',
            'css': {
                'position': 'fixed',
                'top': '180px',
                'right': '10px',
                'width': '300px',
                'zIndex': 50000
            }
        },

        'toast': {
            'template': '<div class="alert alert-%priority% alert-dismissible" role="alert">' +
                '<button type="button" class="close" data-dismiss="alert">' +
                '<span aria-hidden="true">&times;</span>' +
                '<span class="sr-only">Close</span>' +
                '</button>' +
                '<span class="title"></span><span class="message"></span>' +
                '</div>',

            'defaults': {
                'title': '',
                'priority': 'success'
            },

            'css': {},
            'cssm': {},
            'csst': {},

            'fade': 'veryslow',

            'display': function($toast) {
                return $toast.fadeIn(settings.toast.fade);
            },

            'remove': function($toast, callback) {
                return $toast.animate({
                    opacity: '0',
                    padding: '0px',
                    margin: '0px',
                    height: '0px'
                }, {
                    duration: settings.toast.fade,
                    complete: callback
                });
            }
        },

        'debug': false,
        'timeout': 1500,
        'stylesheet': null,
        'donotdismiss': []
    };

    var settings = {};
    $.extend(settings, defaults);

    $.toaster = function(options) {
        console.log('dis');
        if (typeof options === 'object') {
            if ('settings' in options) {
                settings = $.extend(true, settings, options.settings);
            }
        } else {
            var values = Array.prototype.slice.call(arguments, 0);
            var labels = ['message', 'title', 'priority'];
            options = {};

            for (var i = 0, l = values.length; i < l; i += 1) {
                options[labels[i]] = values[i];
            }
        }

        var title = (('title' in options) && (typeof options.title === 'string')) ? options.title : settings.toast.defaults.title;
        var message = ('message' in options) ? options.message : null;
        var priority = (('priority' in options) && (typeof options.priority === 'string')) ? options.priority : settings.toast.defaults.priority;

        if (message !== null) {
            toasting.notify(title, message, priority);
        }
    };

    /*
        Function to display a warning based on 
        attributes passed in via the `res` object.

        Defaults to using:
            res.error || res.errors
        
        Specifying errorAttributes will use user defined error arrributes to display the warning.

        Currently supports string errors and instances of Javascript Error class.

        This will be useful for handling any error responses from the server.
    */
    $.toaster.error = function(priority, res, callback, errorAttributes, statusAttribute) {
        if (errorAttributes && !Array.isArray(errorAttributes))
            throw new Error('Invalid error attributes,must be array');

        if (!(typeof priority == 'string'))
            throw new Error('Priority must be a stirng');

        const createErrorToast = function(err, status, callback) {
            var errorMessage;

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err == 'string') {
                errorMessage = err;
            } else {
                errorMessage = 'Something went wrong with this action';
            }

            const finalError = callback(status, errorMessage);

            $.toaster({
                priority: priority || 'warning',
                message: finalError
            })
        }

        const displayErrors = function(arr, status, callback) {
            arr.forEach(function(err) {
                if (err && Array.isArray(err)) {
                    err.forEach(function(err) {
                        createErrorToast(err, status,
                            ((typeof callback == 'function' && callback) || function() {
                                return null;
                            }))
                    })
                } else if (err) {
                    createErrorToast(err, status,
                        ((typeof callback == 'function' && callback) || function() {
                            return null;
                        }));
                }
            })
        }
        if (errorAttributes) {
            const arr = []
            for (var i = 0; i < errorAttributes.length; i++) {
                arr.push(res[errorAttributes[i]])
            }
            displayErrors(arr, res[statusAttribute || 'status'], callback);
        } else {
            displayErrors([res.errors, res.error], res[statusAttribute || 'status'], callback);
        }
    }


    $.toaster.reset = function() {
        settings = {};
        $.extend(settings, defaults);
    };
})(jQuery);