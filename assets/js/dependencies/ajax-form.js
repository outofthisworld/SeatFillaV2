(function($) {
    $.fn.ajaxForm = function(cb) {
        if (!cb) throw new Error('Invalid params');

        $(this).each(function() {
            console.log(this)
            if (!$(this).is('form')) {
                throw new Error('Invalid usage, must be used on a form element')
            }
            const action = $(this).attr('action')
            const method = $(this).attr('method') || 'GET'

            if (!action) {
                throw new Error('Invalid form usage, action must be specified on the form')
            }
            const $form = $(this)

            $form.validate({
                errorPlacement: function(label, element) {
                    label.addClass('alert')
                    label.addClass('alert alert-warning');
                    label.css({
                        "font-size": "12px"
                    })
                    label.insertAfter(element);

                },
                wrapper: 'div'
            });

            $($form).on('submit', function(e) {
                e.stopImmediatePropagation()
                e.preventDefault();
                if ($form.valid() && $form[0].checkValidity()) {
                    $.ajax({
                        data: $form.serialize(),
                        url: action,
                        method,
                        success: function(res, ts, xhr) {
                            cb.call($form, null, res, xhr, ts);
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            cb.call($form, new Error('Invalid response'), jqXHR.responseJSON, jqXHR, textStatus, errorThrown)
                        }
                    })
                } else {
                    $form.validate();
                    $form.find(':submit').click()
                }
            })
        })
    }

    $.resHasError = function(res) {
        return !res || res.error || res.errors;
    }

    $.stringifyResponseError = function(res, xhr, defaultMsg) {
        if (!res) return ['An unknown error occcurred']

        function getErrorMessage(err) {
            if (err instanceof Error) {
                return err.errorMessage || 'Oh no! An unknown error occurred';
            } else if (typeof err == 'string') {
                return res.error;
            } else {
                return defaultMsg || err.toString();
            }
        }

        if (res.error) {
            return [getErrorMessage(res.error)]
        } else if (res.errors) {
            return res.errors.map(function(err) {
                return getErrorMessage(err);
            })
        } else {
            return [({
                400: 'Sorry, an invalid request has been sent to the server',
                500: 'Sorry, this action was not performed. A server error has occurred.',
                404: 'This resource cannot be found. Please try looking elsewhere!'
            })[xhr.status || res.status]] || [defaultMsg] || [err.toString()];
        }
    }

    $.ajaxFormHandler = function(options) {
        return function(err, res, xhr, ts, errorThrown) {
            if (err || res && (res.error || res.errors)) {
                if (options && res && options[res.status] && options[res.status] == 'function') {
                    $.toaster({
                        priority: 'danger',
                        message: 'Error: ' + options[res.status].call(null)
                    })
                } else if ($.resHasError(res, xhr)) {
                    $.toaster({
                        priority: 'danger',
                        message: 'Error: ' + $.stringifyResponseError(res)[0]
                    })
                } else {
                    $.toaster({
                        priority: 'danger',
                        message: 'Error: ' + (options.errorMessage || '') + ' ' + errorThrown
                    })
                }
            } else {
                if (res && xhr.status == 200 && (!res.errors && !res.error)) {
                    $(this).find("input[type=text], textarea").val("")
                    if (options && options.successMessage) $.toaster({
                        priority: 'info',
                        message: options.successMessage
                    })
                } else {
                    $.toaster({
                        priority: 'info',
                        message: 'No error occurred but response status was not 200 or response was empty?'
                    })
                }
            }
        }
    }
})(jQuery)