/*
    Contains all the configuration and global variables for the Seatfilla website.

    Created by Dale.
*/


window.seatfilla = window.seatfilla || {};
window.seatfilla.globals = window.seatfilla.globals || {};


window.seatfilla.globals.site = {
    baseURL: '127.0.0.1',
    siteName: 'SeatFilla',
    pageUrls: [],
    endpoints: {
        maps: {
            retrieveFlightInfo: {
                method: 'POST',
                URL: '/maps/retrieveFlightInfo'
            },
            retrieveHotelInfo: {

            },
            retrieveCarInfo: {

            }
        },
        lookupservice: {
            getCurrencyCodes: {
                method: 'GET',
                url: '/lookupservice/getSkyScannerCurrencyCodes'
            }
        },
        seatfillasettings: {
            setCurrencyCodePreference: {
                method: 'POST',
                url: '/seatfillasettings/setCurrencyCodePreference'
            },
            getCurrencyCodePreference: {
                method: 'GET',
                url: '/seatfillasettings/getCurrencyCodePreference'
            },
            setTimeZonePreference: {
                method: 'POST',
                url: '/seatfillasettings/setTimeZonePreference'
            },
            getTimeZonePreference: {
                method: 'GET',
                url: '/seatfillasettings/getTimeZonePreference'
            }
        },
        auth: {

        }
    }
}

window.seatfilla.globals.browserSupportsWebStorage = function() {
    if (typeof(Storage) !== "undefined") {
        return true;
    }
    return false;
}


/*
    Object: window.seatfilla.globals.locale
    Comprises of the locale functions for seatfilla. 
*/

window.seatfilla.globals.locale = window.seatfilla.globals.locale || {};

window.seatfilla.globals.locale.setPrefferedCurrency = function(currencyCode, cb) {
    const url = window.seatfilla.globals.site.endpoints.seatfillasettings.setCurrencyCodePreference.url;
    const type = window.seatfilla.globals.site.endpoints.seatfillasettings.setCurrencyCodePreference.type;
    window.seatfilla.globals.cache.put({
        key: 'sfCurPref',
        type: 'session',
        data: currencyCode
    });
    $.ajax({
        type,
        url,
        data: {
            currencyCodePreference: currencyCode
        },
        success: function(response, textstatus, xhr) {
            cb(xhr.status);
        }
    });
}

window.seatfilla.globals.locale.getPrefferedCurrency = function(cb) {
    if (!typeof cb === 'function') throw new Error('Invalid params');

    const cacheVal = window.seatfilla.globals.cache.get({ key: 'sfCurPref', type: 'session' });
    if (cacheVal) {
        cb(200, cacheVal);
    } else {
        const getCurrencyCodeEndpointUrl = window.seatfilla.globals.site.endpoints.seatfillasettings.getCurrencyCodePreference.url;
        const getCurrencCodeEndpointType = window.seatfilla.globals.site.endpoints.seatfillasettings.getCurrencyCodePreference.type;
        $.ajax({
            type: getCurrencCodeEndpointType,
            url: getCurrencyCodeEndpointUrl,
            success: function(response, textstatus, xhr) {
                cb(xhr.status, response.currencyCodePreference || 'USD');
            }
        });
    }
}


/* End locale functions */



/* 
    Object: window.seatfilla.globals.cache 
    Comprises of the global cache, uses session or local storage to reduce the number
    of requests made to the server.
*/

window.seatfilla.globals.cache = window.seatfilla.globals.cache || {};

window.seatfilla.globals.cache.put = function(options) {
    if (!options || !options.key || !options.data)
        throw new Error('Invalid input into window.seatfilla.globals.cache.put');

    if (!window.seatfilla.globals.browserSupportsWebStorage()) {
        console.log('No browser support for cache');
        return false;
    } else {
        (function useStore(obj) {
            obj.setItem(options.key, JSON.stringify(options.data));
            return true;
        })(((options.type == 'session' ? sessionStorage : localStorage) || sessionStorage));
    }
}

window.seatfilla.globals.cache.get = function(options) {
    if (!options || !options.key)
        throw new Error('Invalid input into window.seatfilla.globals.cache.get');

    if (!window.seatfilla.globals.browserSupportsWebStorage()) {
        console.log('No browser support for cache');
        return false;
    } else {
        return (function useStore(obj) {
            const value = obj.getItem(options.key);
            return JSON.parse(value);
        })((options.type == 'session' ? sessionStorage : localStorage) || sessionStorage)
    }
}

/* End cache */


window.seatfilla.globals.getFirstBrowserLanguage = function() {
    var nav = window.navigator,
        browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
        i,
        language;
    if (Array.isArray(nav.languages)) {
        for (i = 0; i < nav.languages.length; i++) {
            language = nav.languages[i];
            if (language && language.length) {

                return language;
            }
        }
    }
    for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
        language = nav[browserLanguagePropertyKeys[i]];
        if (language && language.length) {
            return language;
        }
    }
    return null;
};

window.seatfilla.globals.mobileType = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

window.seatfilla.globals.isMobile = function() {
    var check = false;
    (function(a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};


window.seatfilla.globals.forms = window.seatfilla.globals.forms || {};

window.seatfilla.globals.forms.validationWarningDiv = $('<div></div>').addClass('alert').addClass('alert-warning').addClass('validation-warning').attr('role', 'alert');
window.seatfilla.globals.forms.validationSuccessDiv = $('<div></div>').addClass('alert').addClass('alert-success').addClass('validation-success').attr('role', 'alert');

window.seatfilla.globals.forms.validateAndSerialize = function(form, successElement, errorElement, options) {

    if (!options || !form || 'endpoint' in options || typeof form !== 'string') {
        throw new Error('Invalid params');
    }

    if (!form.startsWith('#') && !form.startsWith('.')) {
        form = "#" + form;
    }

    const validationWarningDiv = window.seatfilla.globals.forms.validationWarningDiv;
    const validationSuccessDiv = window.seatfilla.globals.forms.validationSuccessDiv;

    console.log('validation form');

    const type = options.method || $(form).attr('method') || 'POST';
    const url = options.url || $(form).attr('action') || '/user/create/';
    console.log('Sending ' + type + ' request to ' + url);
    console.log(form);
    $(form).validate({
        submitHandler: function(form) {
            $.ajax({
                type,
                url,
                data: $(form).serialize(),
                success: function(response) {
                    console.log('sending ajax serialized form ');
                    console.log(response);
                    if (response && response.status == 200) {
                        console.log('status was 200');
                        if (options.success) {
                            options.success(200, response, response.message);
                        }
                        if (successElement) {
                            $(successElement).html("").text("");
                            $(successElement).append(validationSuccessDiv.append($('<p></p>').text(options.successMessage || response.message)));
                        }
                    } else {
                        console.log('status was 500');
                        if (errorElement && response) {
                            $(errorElement).html("").text("");
                            if (options.errorMessage || response.errorMessage || response.error && (response.error.message || response.error.errorMessage)) {
                                $(errorElement).append($('<p></p>').text(options.errorMessage || response.errorMessage || response.error.message || response.error.errorMessage));
                            }
                            if (response.error && 'invalidAttributes' in response.error) {
                                for (var err in response.error.invalidAttributes) {
                                    $(errorElement).append(validationWarningDiv.append($('<p></p>').text(response.error.invalidAttributes[err][0].message)));
                                }
                            }
                        }
                        if (options.error) {
                            options.error(response.status, response, options.errorMessage || response.errorMessage || response.error.message || response.error.errorMessage)
                        }
                    }
                },
            });
        }
    });

    window.seatfilla.globals.moveWindowToId = function(id) {
        window.location = ("" + window.location).replace(/#[A-Za-z0-9_]*$/, '') + id;
    }
}