window.seatfilla = window.seatfilla || {}
window.seatfilla.globals = window.seatfilla.globals || {}

window.seatfilla.globals.site = {
  baseURL: '127.0.0.1',
  siteName: 'SeatFilla',
  pageUrls: [],
  endpoints: {
    maps: {
      retrieveFlightInfo: {
        method: 'POST',
        url: '/maps/retrieveFlightInfo'
      },
      retrieveBookingDetails: {
        method: 'POST',
        url: '/maps/retrieveBookingDetails'
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

window.seatfilla.globals.browserSupportsWebStorage = function () {
  if (typeof (Storage) !== 'undefined') {
    return true
  }
  return false
}

window.seatfilla.globals.tryParseJsonResult = function (result) {
  try {
    return JSON.parse(result)
  } catch (err) {
    return result
  }
}

/*
    Object: window.seatfilla.globals.locale
    Comprises of the locale functions for seatfilla. 
*/

window.seatfilla.globals.locale = window.seatfilla.globals.locale || {}

window.seatfilla.globals.locale.setPrefferedCurrency = function (currencyCode, cb) {
  if (!typeof cb === 'function') throw new Error('Invalid params to seatfilla-config.js/setPrefferedCurrency')

  window.seatfilla.globals.cache.put({
    key: 'CurrencyCodePreference',
    type: 'session',
    data: currencyCode,
    useServerStore: true,
    success: cb
  })
}

window.seatfilla.globals.locale.getPrefferedCurrency = function (cb) {
  if (!typeof cb === 'function') throw new Error('Invalid params to seatfilla-config.js/getPrefferedCurrency')

  window.seatfilla.globals.cache.get({
    key: 'CurrencyCodePreference',
    type: 'session',
    useServerStore: true,
    success: function (status, result) {
      console.log('Getting currency code preference from cache ' + status + ' result was ' + result)
      if (status == 200 && result) {
        // If they have set a preference.. use that.
        return cb(status, result)
      } else {
        // Here we will check to see if we have their location which
        // we can derive currency information from
        window.seatfilla.globals.geolocation.getUserCountryInformation(function (s, r) {
          console.log('R is: ')
          console.log(r)
          console.log(JSON.stringify(r))
          if (s == 200 && r) {
            if (r && r.currencies && Array.isArray(r.currencies)) {
              window.seatfilla.globals.locale.setPrefferedCurrency(r.currencies[0], function (status, result) {
                console.log('Attempted to set preffered currency to ' + r.currencies[0])
              })
              return cb(status, r.currencies[0])
            }else {
              return cb(status, 'USD')
            }
          } else {
            return cb(s, 'USD')
          }
        })
      }
    }
  })
}

/* End locale functions */

/* Seatfilla cookies support, incase client side local storage isn't supported */
window.seatfilla.globals.cookies = window.seatfilla.globals.cookies || {}

window.seatfilla.globals.cookies.setCookie = function (cname, cvalue, exdays) {
  var d = new Date()
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
  var expires = 'expires=' + d.toUTCString()
  document.cookie = cname + '=' + JSON.stringify(cvalue) + '; ' + expires
}

window.seatfilla.globals.cookies.getCookie = function (cname) {
  var name = cname + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return window.seatfilla.globals.tryParseJsonResult(c.substring(name.length, c.length))
    }
  }
  return null
}
/* end cookies */

/* 
    Object: window.seatfilla.globals.cache 
    Comprises of the global cache, uses session or local storage to reduce the number
    of requests made to the server.
*/

window.seatfilla.globals.cache = window.seatfilla.globals.cache || {}
window.seatfilla.globals.cache.events = window.seatfilla.globals.cache.events || {}

window.seatfilla.globals.cache.on = function (eventType, func, eventIdentifier) {
  if (!(typeof func == 'function'))
    throw new Error('Invalid params to seatfilla-config.js/window.seatfilla.globals.cache.on')

  if (!(eventType in window.seatfilla.globals.cache.events) ||
    !Array.isArray(window.seatfilla.globals.cache.events[eventType])) {
    window.seatfilla.globals.cache.events[eventType] = []
  }

  if (eventIdentifier)
    func.cacheEventIdentifer = eventIdentifier

  window.seatfilla.globals.cache.events[eventType].push(func)
}

window.seatfilla.globals.cache.removeOn = function (eventType, optIdentifier) {
  if (!typeof eventType == 'string' || (optIdentifier && !(typeof optIdentifier == 'string')))
    throw new Error('Invalid params to seatfilla-config.js/removeOn')

  if (!eventType in window.seatfilla.globals.cache.events)
    throw new Error('Invalid event type in seatfilla-config.js/removeOn')

  if (optIdentifier) {
    window.seatfilla.globals.cache.events[eventType].filter(function (it, indx) {
      if (it.optIdentifier == optIdentifier) {
        console.log('Removing cache event with event type ' + eventType + ' with identifier ' + optIdentifier)
        window.seatfilla.globals.cache.events[eventType].slice(indx, 1)
      }
    })
  }else {
    console.log('Removing all cache events with event type ' + eventType)
    delete window.seatfilla.globals.cache.events[eventType]
  }
}

window.seatfilla.globals.cache.notifyCacheEvent = function (eventType, params) {
  const _self = this

  if (window.seatfilla.globals.cache.events[eventType]) {
    const arr = window.seatfilla.globals.cache.events[eventType]

    arr.forEach(function (value) {
      value.apply(_self, params)
    })
  }
}

window.seatfilla.globals.cache.put = function (options) {
  if (!options || !options.key || !options.data)
    throw new Error('Invalid input into window.seatfilla.globals.cache.put')

  const callback = options.success && typeof options.success == 'function' ? options.success : function () {}
  const eventObj = {}

  if (!window.seatfilla.globals.browserSupportsWebStorage()) {
    if (navigator.cookieEnabled) {
      window.seatfilla.globals.cookies.setCookie(options.key, JSON.stringify(options.data), options.expiration || 1)
      eventObj.storedInCookie = true
    }
  } else {
    (function useStore (obj) {
      eventObj.storedInLocalOrSessionStorage = true
      obj.setItem(options.key, JSON.stringify(options.data))
    })(((options.type == 'session' ? sessionStorage : localStorage) || sessionStorage))
  }

  if (options.useServerStore) {
    console.log('Sending ' + JSON.stringify(options) + ' to server')
    $.ajax({
      type: 'POST',
      url: '/SeatfillaSettings/setStoredSettings',
      data: {
        'data': [options]
      },
      success: function (result, s, xhr) {
        const res = window.seatfilla.globals.tryParseJsonResult(result)
        console.log('Recieved result from posting key: ' + options.key + ' with data ' + JSON.stringify(options.data) + ' to SeatfillaSettings/setStoredSettings')
        console.log('Response was ' + JSON.stringify(res))
        eventObj.useServerStore = true
        eventObj.serverResult = res
        eventObj.objectResultStatus = res.status
        eventObj.xhrResponseStatus = xhr.status
        window.seatfilla.globals.cache.notifyCacheEvent('store', [options.key, options, eventObj])
        console.log('Returning return code ' + res.status + ' for cache put (server store) for key ' + options.key)
        return callback(res.status, res)
      }
    })
  }else {
    const returnCode = eventObj.storedInCookie || eventObj.storedInLocalOrSessionStorage ? 200 : 500
    console.log('Returning return code ' + returnCode + ' for cache put for key ' + options.key)
    console.log('Not using server store')
    window.seatfilla.globals.cache.notifyCacheEvent('store', [options.key, options, eventObj])
    return callback(returnCode, eventObj)
  }
}

window.seatfilla.globals.cache.get = function (options) {
  if (!options || !options.key)
    throw new Error('Invalid input into window.seatfilla.globals.cache.get')

  const callback = options.success && typeof options.success == 'function' ? options.success : function () {}

  if (!window.seatfilla.globals.browserSupportsWebStorage()) {
    if (navigator.cookieEnabled) {
      return callback(200, window.seatfilla.globals.cookies.getCookie(options.key))
    } else if (options.useServerStore) {
      $.ajax({
        type: 'POST',
        url: '/SeatfillaSettings/getStoredSettings',
        data: {
          key: options.key
        },
        success: function (result, s, xhr) {
          console.log('Got stored setting for key ' + options.key)
          console.log('result was ' + result)
          const res = window.seatfilla.globals.tryParseJsonResult(result)
          return callback(result.status || xhr.status, result[options.key] || null)
        }
      })
    }
  } else {
    return (function useStore (obj) {
      const value = obj.getItem(options.key)
      return callback(200, window.seatfilla.globals.tryParseJsonResult(value))
    })((options.type == 'session' ? sessionStorage : localStorage) || sessionStorage)
  }
}

/* End cache */

/* Geo location */

window.seatfilla.globals.geolocation = window.seatfilla.globals.geolocation || {}

window.seatfilla.globals.geolocation.setUserLocation = function (location, callback) {
  window.seatfilla.globals.cache.put({
    key: 'CurrentLocation',
    data: location,
    type: 'session',
    useServerStore: true,
    success: callback
  })
}

window.seatfilla.globals.setUser = function(user,callback){
    window.seatfilla.globals.cache.put({
    key: 'user',
    data: user,
    type: 'session',
    useServerStore: false,
    success: callback
  })
}

window.seatfilla.globals.getUser = function (callback) {
   window.seatfilla.globals.cache.get({
    key: 'user',
    type: 'session',
    useServerStore: false,
    success: function (status, result) {
      if(status == 200 && result && result.id){
          console.log('retrieved user from cache')
          return callback(status,result);
      }else{
          console.log('Retrieving user from server call')
         $.ajax({
            url: '/user/getCurrentUser',
            method: 'GET',
            success: function (data, r, xhr) {
              return callback(xhr.status, data)
            },
            error: function () {
              return callback(500, null)
            }
         })
      }
    }
});
}

window.seatfilla.globals.geolocation.getUserLocation = function (callback) {
  window.seatfilla.globals.cache.get({
    key: 'CurrentLocation',
    type: 'session',
    useServerStore: true,
    success: callback
  })
}
/*
    A function to retrieve additional information about a users country.
*/
window.seatfilla.globals.geolocation.getUserCountryInformation = function (cb) {
  window.seatfilla.globals.cache.get({
    key: 'CountryInformation',
    type: 'session',
    useServerStore: false,
    success: function (status, result) {
      function makeAJAXCountryInfoReq (r) {
        $.ajax({
          type: 'POST',
          url: '/LookupService/getCountryInformation',
          data: {
            countryName: r.address.country,
            countryCode: r.address.countryCode,
            region: r.address.region
          },
          success: function (res, s, xhr) {
            res = window.seatfilla.globals.tryParseJsonResult(res)
            console.log('Recieved info from /LookupService/getCountryInformation/:')
            console.log(res)
            if (res.currencies && res.currencies.length > 0) {
              window.seatfilla.globals.cache.put({
                key: 'CountryInformation',
                type: 'session',
                data: res,
                useServerStore: false,
                success: cb
              })

              return cb(200, res)
            } else {
              return cb(200, {currencies: ['USD']})
            }
          }
        })
      }

      if (status == 200 && result) {
        console.log('Got country information from cache')
        return cb(status, result)
      } else {
        window.seatfilla.globals.geolocation.getUserLocation(function (s, r) {
          // If we can find the users location...
          if (s == 200 && r) {
            console.log('Succesfully found user location')
            // Make a call to an external service to determine currency for country
            makeAJAXCountryInfoReq(r)
          } else {
            const currentTime = new Date().getTime()
            var madeReq = false
            window.seatfilla.globals.cache.on('store', function (key, options, eventObj) {
              console.log('Global cache on store event : ' + key)
              console.log('options were: ' + JSON.stringify(options))
              console.log('eventObj was : ' + JSON.stringify(eventObj))
              if (key == 'CurrentLocation' && new Date().getTime() - currentTime < 10000) {
                console.log('Making ajax request with options from cache store callback')
                madeReq = true
                makeAJAXCountryInfoReq(options.data)
              }
            }, 'tempUserLocEvent')

            setTimeout(function () {
              if (!madeReq) {
                window.seatfilla.globals.cache.removeOn('store', 'tempUserLocEvent')
                return cb(200, 'USD')
              }
            }, 10000)
          }
        })
      }
    }
  })
}

/* end geoLocation */

window.seatfilla.globals.getFirstBrowserLanguage = function () {
  var nav = window.navigator,
    browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
    i,
    language
  if (Array.isArray(nav.languages)) {
    for (i = 0; i < nav.languages.length; i++) {
      language = nav.languages[i]
      if (language && language.length) {
        return language
      }
    }
  }
  for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
    language = nav[browserLanguagePropertyKeys[i]]
    if (language && language.length) {
      return language
    }
  }
  return null
}

window.seatfilla.globals.mobileType = {
  Android: function () {
    return navigator.userAgent.match(/Android/i)
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i)
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i)
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i)
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i)
  },
  any: function () {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows())
  }
}

window.seatfilla.globals.isMobile = function () {
  var check = false
  ;(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera)
  return check
}

window.seatfilla.globals.forms = window.seatfilla.globals.forms || {}

window.seatfilla.globals.forms.validationWarningDiv = $('<div></div>').addClass('alert').addClass('alert-warning').addClass('validation-warning').attr('role', 'alert')
window.seatfilla.globals.forms.validationSuccessDiv = $('<div></div>').addClass('alert').addClass('alert-success').addClass('validation-success').attr('role', 'alert')

window.seatfilla.globals.forms.validateAndSerialize = function (form, successElement, errorElement, options) {
  if (!options || !form || 'endpoint' in options || typeof form !== 'string') {
    throw new Error('Invalid params')
  }

  if (!form.startsWith('#') && !form.startsWith('.')) {
    form = '#' + form
  }

  const validationWarningDiv = window.seatfilla.globals.forms.validationWarningDiv
  const validationSuccessDiv = window.seatfilla.globals.forms.validationSuccessDiv

  console.log('validation form')

  const type = options.method || $(form).attr('method') || 'POST'
  const url = options.url || $(form).attr('action') || '/user/create/'
  console.log('Sending ' + type + ' request to ' + url)
  console.log(form)
  $(form).validate({
    submitHandler: function (form) {
      $.ajax({
        type,
        url,
        data: $(form).serialize(),
        success: function (response) {
          console.log('sending ajax serialized form ')
          console.log(response)
          if (response && response.status == 200) {
            console.log('status was 200')
            if (options.success) {
              options.success(200, response, response.message)
            }
            if (successElement) {
              $(successElement).html('').text('')
              $(successElement).append(validationSuccessDiv.append($('<p></p>').text(options.successMessage || response.message)))
            }
          } else {
            console.log('status was 500')
            if (errorElement && response) {
              $(errorElement).html('').text('')
              if (options.errorMessage || response.errorMessage || response.error && (response.error.message || response.error.errorMessage)) {
                $(errorElement).append($('<p></p>').text(options.errorMessage || response.errorMessage || response.error.message || response.error.errorMessage))
              }
              if (response.error && 'invalidAttributes' in response.error) {
                for (var err in response.error.invalidAttributes) {
                  $(errorElement).append(validationWarningDiv.append($('<p></p>').text(response.error.invalidAttributes[err][0].message)))
                }
              }
            }
            if (options.error) {
              options.error(response.status, response, options.errorMessage || response.errorMessage || response.error.message || response.error.errorMessage)
            }
          }
        }
      })
    }
  })
}

window.seatfilla.globals.moveWindowToId = function (id) {
  window.location = ('' + window.location).replace(/#[A-Za-z0-9_]*$/, '') + id
}
/*
window.seatfilla.globals.data.retrieveCityData().forEach(function(item) {
                $('.cities').append($('<option></option>', { value: item.iataCode, 'data-val-cityname': item.name })
                .text(item.name + ', ' + item.countryName))
         })
*/
window.seatfilla.globals.response = window.seatfilla.globals.response || {}
window.seatfilla.globals.response.skyscannerAPI = window.seatfilla.globals.response.skyscannerAPI || {}
window.seatfilla.globals.request = window.seatfilla.globals.request || {}
window.seatfilla.globals.request.skyscannerAPI = window.seatfilla.globals.request.skyscannerAPI || {}

window.seatfilla.globals.request.skyscannerAPI.sendFlightInfoAjaxRequest = function (options) {
  if (options.formValidation) {
    var $form = $(options.formValidation)
    if (!$form[0].checkValidity()) {
      $form.find(':submit').click()
      return
    }
  }

  const departure = options.data.departureDate
  const arrival = options.data.returnDate
  const numChildTickets = options.data.numChildTickets
  const numAdultTickets = options.data.numAdultTickets
  const numInfantTickets = options.data.numInfantTickets

  const data = {
    prefferedCabinClass: options.data.prefferedCabinClass,
    groupPricing: options.data.groupPricing,
    dates: {departure,arrival},
    ticketInfo: { numAdultTickets, numChildTickets, numInfantTickets},
    destination: {iataCode: options.data.destinationCityIata},
    origin: {iataCode: options.data.departureCityIata},
    currencyCodePreference: options.data.currencyCodePreference
  }


  $.ajax({
    type: window.seatfilla.globals.site.endpoints.maps.retrieveFlightInfo.method,
    url: window.seatfilla.globals.site.endpoints.maps.retrieveFlightInfo.url,
    data: data,
    success: options.handlers.success,
    error: options.handers.error
  })
}

/*
  Maps a hotel API response, done client side
  to reduce server load and spread computation 
  to client side.
*/
window.seatfilla.globals.response.skyscannerAPI.mapHotelAPIResponse = function (result, options) {
  if (!result || !result.hotels) throw new Error('Invalid results object in seatfilla-config.js')

  const imageHostUrl = result.image_host_url

  result.hotels = result.hotels.map(function (hotel) {
    if (hotel) {
      hotel.amenities = hotel.amenities.map(function (amId) {
        const amenity = result.amenities.find(function (amen) {
          return amen.id == amId
        })

        if (!amenity) throw new Error('Invalid response mapping in seatfilla-config.js/mapHotelApiResponse')

        return amenity
      })

      if (hotel.images && imageHostUrl) {
        const arr = []
        for (var key in hotel.images) {
          const firstPathPart = imageHostUrl + key
          for (var keyTwo in hotel.images[key]) {
            const width = hotel.images[key][keyTwo][0]
            const height = hotel.images[key][keyTwo][1]

            // We can change this into a callback later, but for now a range is good
            var greaterThanOrETSmallestWidth = false
            var lessThanOrETGreatestWidth = false
            var greaterThanOrETSmallestHeight = false
            var lessThanOrETGreatestHeight = false

            if (keyTwo.endsWith('order') || keyTwo.endsWith('provider'))
              continue

            if (options) {
              if ((options.smallestWidth && width >= options.smallestWidth) || !options.smallestWidth)
                greaterThanOrETSmallestWidth = true

              if ((options.greatestWidth && width <= options.greatestWidth) || !options.greatestWidth)
                lessThanOrETGreatestWidth = true

              if ((options.smallestHeight && height >= options.smallestHeight) || !options.smallestHeight)
                greaterThanOrETSmallestHeight = true

              if ((options.greatestWidth && height <= options.greatestHeight) || !options.greatestHeight)
                lessThanOrETGreatestHeight = true

              if (greaterThanOrETSmallestWidth && lessThanOrETGreatestWidth &&
                greaterThanOrETSmallestHeight && lessThanOrETGreatestHeight)
                arr.push({imagePath: firstPathPart + keyTwo, width, height})
            }else {
              arr.push({imagePath: firstPathPart + keyTwo, width, height})
            }
          }
        }
        hotel.images = arr
      }

      return hotel
    }else {
      return null
    }
  }).filter(function (hotel) {
    return hotel != null
  })

  if ('hotels_prices' in result) {
    result['hotels_prices'].map(function (hotelPrice) {
      if ('agent_prices' in hotelPrice) {
        hotelPrice['agent_prices'] = hotelPrice['agent_prices'].map(function (agentPrice) {
          const agent = result.agents.find(function (result) {
            console.log('result: ' + result)
            console.log('agent price: ' + agentPrice)
            return result.id == agentPrice.id
          })

          agentPrice.id = agent
          return agentPrice
        })
      }
      return hotelPrice
    })
  }
  return result
}


window.seatfilla.globals.userprofile = window.seatfilla.globals.userprofile || {}
window.seatfilla.globals.userprofile.getCurrentUserProfileUser = function (location) {
  if (!location) return
  var parts = location.split('/')
  if (parts.length && !parts[0]) parts = parts.slice(1, parts.length)
  if (parts.length < 2 || parts[0].toLowerCase() != 'userprofile') return null
  return (parts[1]).toLowerCase()
}


