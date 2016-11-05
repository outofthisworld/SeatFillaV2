const _find = require('../out/find')
const _create = require('../out/create')
const _findOne = require('../out/findOne')

module.exports = {
  retrieveSkyScannerListings(req, res) {
    async.auto({
      getPrefferedCurrency: function (callback) {
        UserSettingsService.getUserCurrencyCodePreference(req).then(function (preference) {
          sails.log.debug('User currency code preference was : ' + preference)
          return callback(null, preference)
        }).catch(function (err) {
          sails.log.error(err)
          return callback(err, null)
        })
      },
      getUserLocation: function (callback) {
        UserSettingsService.getUserCurrentLocation(req).then(function (result) {
          sails.log.debug('User location was : ' + JSON.stringify(result))
          return callback(null, result)
        }).catch(function (err) {
          sails.log.error(err)
          return callback(err, null)
        })
      },
      getUserLocalePreference: function (callback) {
        UserSettingsService.getUserLocalePreference(req).then(function (result) {
          sails.log.debug('User locale preference was :' + result)
          return callback(null, result)
        }).catch(function (err) {
          sails.log.error(err)
          return callback(err, null)
        })
      },
      retrieveMostReleventHotel: ['getPrefferedCurrency', 'getUserLocation', 'getUserLocalePreference', function (callback, results) {
        SkyScannerLookupService.getHotelAutoSuggestResults({
          countryCode: ((req.param('destination') && req.param('destination').countryId) || (results.getUserLocation && results.getUserLocation.countryCode)) || 'NZ',
          currencyCode: req.param('prefferedCurrency') || results.getPrefferedCurrency,
          locale: req.headers['accept-language'] || results.getUserLocalePreference,
          query: req.param('hotelQuery') || results.getUserLocation && resuts.getUserLocation.region ||
            results.getUserLocation && results.getUserLocation.city || results.getUserLocation && results.getUserLocation.country || 'Paris'
        }).then(function (result) {
          sails.log.debug('Results from getHotel auto suggestions: ' + JSON.stringify(result))
          const hotelSuggestions = result.results

          // No results obtained
          if (!hotelSuggestions || !Array.isArray(hotelSuggestions) || hotelSuggestions.length == 0)
            return callback(null, null)

          // Link the results to their places
          const mappedSuggestions = hotelSuggestions.map(function (suggestion) {
            const parentPlace = result.places.find(function (element) {
              return element['place_id'] == suggestion['parent_place_id']
            })

            if (!parentPlace)
              callback(new Error('Invalid mapping in response from hotel auto suggestion service in ListingsController.js/retrieveMostReleventHotels'), null)

            suggestion['parent_place_id'] = parentPlace
            return suggestion
          })

          // Find the most relevent suggestion for this user
          const mostRelSuggestion = mappedSuggestions.find(function (suggestion) {
            sails.log.debug('Checking hotel suggestion: ' + JSON.stringify(suggestion))

            if (!suggestion['parent_place_id'] || !suggestion['parent_place_id']['city_name'] || !suggestion['parent_place_id']['country_name'])
              return false

            const cityContainsQuery = suggestion['parent_place_id']['city_name'].includes(req.param('hotelQuery') && req.param('hotelQuery').toLowerCase() || '')
            const countryContainsQuery = suggestion['parent_place_id']['country_name'].toLowerCase().includes(req.param('hotelQuery') && req.param('hotelQuery').toLowerCase() || '')
            const cityContainsUserCity = suggestion['parent_place_id']['city_name'].toLowerCase().includes(results.getUserLocation && results.getUserLocation.city.toLowerCase() || '')
            const countryContainsUserCountry = suggestion['parent_place_id']['country_name'].toLowerCase().includes(results.getUserLocation && results.getUserLocation.country.toLowerCase() || '')
            const def = true; // suggestion['parent_place_id']['city_name'].toLowerCase().includes('Auckland')

            sails.log.debug('City contains query ' + cityContainsQuery)
            sails.log.debug('Country contains query: ' + countryContainsQuery)
            sails.log.debug('City contains user city ' + cityContainsUserCity)
            sails.log.debug('Country contains user country ' + countryContainsUserCountry)
            sails.log.debug('Default: ' + def)

            return (((suggestion['geo_type'] == 'City' || suggestion['geo_type'] == 'Nation') &&
              ((
              // Any of these
              cityContainsQuery || countryContainsQuery ||
              cityContainsUserCity || countryContainsUserCountry
              )) || def)) && true; // This must be here, we're returning true to find, not a found object.
          })

          sails.log.debug('Most relevent hotel was : ' + JSON.stringify(mostRelSuggestion))
          return callback(null, mostRelSuggestion || null)
        }).catch(function (err) {
          sails.log.error(err)
          return callback(err, null)
        })
      }],
      buildSessionObject: ['retrieveMostReleventHotel', function (callback, results) {
        const sessionObject = SkyScannerHotelService.getDefaultSessionObject()
        sails.log.debug('Results are: ' + JSON.stringify(results))
        sails.log.debug('Args are: ' + JSON.stringify(arguments))
        // The country id of the destination hotel
        sessionObject.market = (req.param('destination') && req.param('destination').countryId) || (results.getUserLocation && results.getUserLocation.countryCode) || 'NZ'
        // The users currency
        sessionObject.currency = req.param('prefferedCurrency') || results.getPrefferedCurrency
        // The users locale
        sessionObject.locale = req.headers['accept-language'] || results.getUserLocalePreference

        // Where the hotel is (Here we will check countryInfo for long lat to a country if we can't get it from users location)
        sessionObject.entityId = results.retrieveMostReleventHotel && results.retrieveMostReleventHotel['individual_id'] ||
          (((results.getUserLocation && results.getUserLocation.longitude) || 36.8485) +
          ',' + ((results.getUserLocation && results.getUserLocation.latitude) || 174.7633)) + '-latlong'

        // The check in date for the hotel
        sessionObject.checkindate = (req.param('dates') && req.param('dates').departure) || (new Date().toISOString().slice(0, 10))

        // The check out date
        const week = new Date()
        week.setDate(new Date().getDate() + 7)
        sessionObject.checkoutdate = (req.param('dates') && req.param('dates').arrival) || (week.toISOString().slice(0, 10))
        // The number of guests
        sessionObject.guests = req.param('numberOfGuests') || 1

        sessionObject.rooms = req.param('numRooms') || 1

        sails.log.debug('Created hotels session object : ' + JSON.stringify(sessionObject))
        return callback(null, sessionObject)
      }],
      buildRequestObject: ['getPrefferedCurrency', 'getUserLocation', function (callback, results) {
        const hotelRequestObject = SkyScannerHotelService.getDefaultHotelRequestObject()
        // hotelRequestObject.city = req.param('destination').airportCityId
        return callback(null, hotelRequestObject)
      }],
      requestHotelDetails: ['buildSessionObject', 'buildRequestObject', function (callback, results) {
        SkyScannerHotelService.createSession(results.buildSessionObject).then(function (result) {
          return callback(null, result)
        }).catch(function (err) {
          sails.log.error(err)
          callback(err, null)
        })
      }]
    }, function (err, results) {
      if (err) {
        sails.log.error(err)
        return res.badRequest(err)
      } else {
        sails.log.debug('Results were : ' + JSON.stringify(results))
        return res.ok({
          status: 200,
          result: results
        })
      }
    })
  },
  create(req, res) {
    sails.log.debug('In hotel/create')

    // Allow ajax get request for html content
    if (req.isGET() && req.wantsJSON) {
      sails.log.debug('Request was get and wants json, returning HTML...')
      res.locals.layout = null
      req.options.layout = null
      return res.view('hotel/create', {
        user: req.user,
        UserProfile: req.options.userprofile,
        layout: null
      })
    }

    sails.log.debug('Creating hotel: recieved params: ')
    sails.log.debug(req.allParams())

    return async.auto({

      // Create the hotel address record
      createAddress: function (callback) {
        Address.create(req.allParams()).then(function (address) {
          return callback(null, address)
        }).catch(function (err) {
          sails.log.error(err)
          return callback(err, null)
        })
      },
      // Create the hotel
      createHotelTuple: [function (callback, results) {

        function handleError (err) {
          sails.log.error(err)
          return callback(err, null)
        }

        req.setParam('user', req.user.id)
        _create(req).then(function (hotel) {
            sails.log.debug('Created hotel record ' + JSON.stringify(hotel));
            return callback(null, hotel)
        }).catch(handleError)

      }],
      // Create hotel info
      createHotelInfo: ['createAddress','createHotelTuple', function (callback, results) {
        const obj = req.allParams()
        obj.address = results.createAddress.id;
        obj.hotel = results.createHotelTuple.id;
        return HotelInfo.create(obj).then(function (hotelInfo) {
          return callback(null, hotelInfo)
        }).catch(function (err) {
          return callback(err,null);
        })
      }],
      createAssociation:['createHotelInfo',function(callback,results){
         results.createHotelTuple.hotelInfo.add(results.createHotelInfo);
         results.createHotelTuple.save(function(err){
           if(err){
             sails.log.error(err);
             return callback(err,null);
           }else{
             return callback(null,'success');
           }
         })
      }],
      // Retrieves the incoming images from the stream
      downloadHotelImages: ['createHotelTuple', function (callback, results) {

        //Make sure we have our file data info
        if(!req.param('fileData')){
          return callback(new Error('File data must be supplied'),null);
        }
        
        var fileData = null;

        try{
          //Parse info about our file data
          fileData = JSON.parse(req.param('fileData'));
          
          //Check to make sure we have info about our file
          if(!Array.isArray(fileData) || fileData.length == 0){
            throw new Error('No files sent with request');
          }
        }catch(err){
          //Catch and return any errors
          return callback(err,null);
        }

        //Loop through our file data asynchrnously
        async.forEachOf(fileData, function (fileData,index,feCb) {

          sails.log.debug('Saving file to ' + sails.config.appPath +  require('util')
            .format('/assets/images/hotels/%s/%s', req.user.id, results.createHotelTuple.id))

          //Start file upload from incoming request
          req.file('file[' + index + ']').upload({
            dirname: sails.config.appPath +  require('util')
            .format('/assets/images/hotels/%s/%s', req.user.id, results.createHotelTuple.id),
            maxBytes: 1024 * 1024 * 200 // 200mb
          }, function whenDone (err, uploadedFiles) {

            //If there is an error, return it to the callback
            if (err) {
              sails.log.error(err)
              sails.log.debug(JSON.stringify(uploadedFiles))
              return callback(err, null)
            } else if (uploadedFiles.length === 0) {
              sails.log.debug('No images provided to hotel/create')
              sails.log.debug(JSON.stringify(uploadedFiles))
              return callback(new Error('No images uploaded'))
            }

            //Debug our uploaded files
            sails.log.debug('Uploaded files were: ' + JSON.stringify(uploadedFiles))

            // Loop through each uploaded file asynchronously, save its file descriptor
            async.each(uploadedFiles, function (file, asyncCb) {

              sails.log.debug('File was : ' + JSON.stringify(file))


              // Create a hotel image record, linked to our previously created hotel
              HotelImage.create({
                hotelInfo:results.createHotelInfo.id,
                fileDescriptor: file.fd,
                width:fileData.width,
                height:fileData.height,
                mimeType:file.type,
                fileName:file.filename,
                fileExt: require('path').extname(file.filename)
              }).then(function (createdHotelImage) {
                results.createHotelInfo.hotelImages.add(createdHotelImage);
                results.createHotelInfo.save(function(err){
                  if(err){
                    sails.log.error(err);
                    return asyncCb(err);
                  }else{
                    return asyncCb();
                  }
                })
              }).catch(function(err){
                  return asyncCb(err);
              })
            }, function (err) {
              // if any of the file processing produced an error, err would equal that error
              if (err) {
                return feCb(err)
              } else {
                return feCb(null)
              }
            })
          })
          }, function (err) {
            // if any of the file processing produced an error, err would equal that error
            if (err) {
              return callback(err, null)
            } else {
              return callback(null, 'success')
            }
        })
    }]
    }, function (err, results) {
      // Check for errors
      if (err) {
        sails.log.error(err)
        sails.log.debug('Returning server error in hotel/create')
        res.serverError()
      } else {
        // Check if we need to respond using JSON
        if (res.wantsJSON) {
          results.createHotelTuple.hotelInfo = results.createHotelInfo
          return res.ok(ResponseStatus.OK, {})
        } else {
          // Redirect to the created hotel.
          return res.redirect('hotel/findOne?id=' + results.createHotelTuple.id)
        }
      }
    })
  },
  find(req, res) {
    return _find(req, res).then(function (hotels) {
      return res.ok({
        status: 200,
        hotels: hotels
      })
    }).catch(function (err) {
      return res.badRequest()
    })
  },
  index(req, res) {
    return res.ok({
      user: req.user
    }, {
      view: 'search/listings/hotels/search-hotels',
      layout: 'layouts/search-layout'
    })
  },
  findOne(req, res) {
    if (!req.param('hotelData') && !req.param('id'))
      return res.badRequest()

    async.auto({
      findOrCreateHotel(callback) {
        var hotelData = null
        var id = null
        var provider = null

        if (req.param('hotelData')) {
          try {
            hotelData = JSON.parse(req.param('hotelData'))
          } catch (err) {
            return callback(new Error('Error parsing hotelData'), null)
          }
          if ('hotel_id' in hotelData) {
            id = hotelData['hotel_id']
            provider = 'Skyscanner'
          } else {
            return callback(new Error('No id supplied via hotelData parameter, invalid request'), null)
          }
        } else if (req.param('id')) {
          hotelData = null
          id = req.param('id')
          provider = 'Seatfilla'
        } else {
          return callback(new Error('Request requires either hotelData || id parameter to be set, both were null.'), null)
        }

        if (provider == 'Seatfilla') {
          // No need to check if hotel isn't null, error will be thrown by _findOne.
          // This will subscribe the requestee to all events via -
          // .publishUpdate(), .publishDestroy(), .publishAdd(), .publishRemove(), and .message().
          _findOne(req).then(function (hotel) {
            return callback(null, {
              id,
              hotel,
            provider})
          }).catch(function (err) {
            sails.log.error(err)
            return callback(err, null)
          })
        } else {
          Hotel.findOrCreate({
          id}, {
          id}).then(function () {
            return callback(null, {
              id,
              hotelData,
            provider})
          }).catch(function (err) {
            return callback(err, null)
          })
        }
      }
    }, function (err, results) {
      if (err) return res.badRequest()
      else return res.ok({
          hotel: results.findOrCreateHotel
        })
    })
  }
}
