module.exports = {
  airports(req, res) {
    return res.ok()
  },
  retrieveFlightInfo(req, res) {
    async.auto({
      createUserLocation: [function (callback, results) {
        if (!req.user) return callback(null, null)

        UserLocationService.findOrCreateUserLocation(req.user, req.body.userLocation).then(function (object) {
          sails.log.debug('Succesfully created user location: ' + JSON.stringify(object.location))
          sails.log.debug('Succesfully created user address: ' + JSON.stringify(object.address))
          return callback(null, object)
        }).catch(function (err) {
          sails.log.error(err)
          return callback(err, null)
        })
      }],
      createUserSearch: [function (callback, results) {
        if (!req.user) return callback(null, null)

        UserSearchService.newUserMapSearch(
          req.user,
          req.body.origin,
          req.body.destination)
          .then(function (userSearch) {
            sails.log.debug('Succesfully created user search ' + JSON.stringify(userSearch))
            return callback(null, userSearch)
          }).catch(function (err) {
          sails.log.error(err)
          sails.log.debug('Error creating user search ' + JSON.stringify(err))
          return callback(err, null)
        })
      }],
      getUserCurrencyCodePreference: [function (callback, results) {
        UserSettingsService.getUserCurrencyCodePreference(req).then(function (pref) {
          return callback(null, pref)
        }).catch(function (err) {
          return callback(err, null)
        })
      }],
      createSessionObject: ['getUserCurrencyCodePreference', function (callback, result) {
        const obj = Object.create(SkyScannerFlightService.sessionObj)

        obj.country = req.body.userLocation.address.countryCode || req.body.origin.airportCountryId || req.body.userLocation.address.country || (req.user && req.user.address.country)
        obj.currency = req.body.currencyCodePreference || result.getUserCurrencyCodePreference || 'USD'
        obj.locale = req.headers['Accept-Language'] || 'en-US'
        obj.originplace = req.body.origin.iataCode
        obj.destinationplace = req.body.destination.iataCode
        obj.outbounddate = (req.body.dates && req.body.dates.departure) || (new Date().toISOString().slice(0, 10))
        obj.inbounddate = (req.body.dates && req.body.dates.arrival) || null
        obj.locationschema = SkyScannerFlightService.locationschemas.Iata
        obj.cabinclass = SkyScannerFlightService.cabinclasses[req.body.prefferedCabinClass] || SkyScannerFlightService.cabinclasses.Economy
        obj.adults = (req.body.ticketInfo && req.body.ticketInfo.numAdultTickets) || 1
        obj.children = (req.body.ticketInfo && req.body.ticketInfo.numChildTickets) || 0
        obj.infants = (req.body.ticketInfo && req.body.ticketInfo.numInfantTickets) || 0
        obj.groupPricing = req.body.groupPricing || false

        sails.log.debug('Created session object: ' + JSON.stringify(obj))
        return callback(null, obj)
      }],
      createItineraryObject: [function (callback, results) {
        const itinObj = SkyScannerFlightService.getDefaultItinObject()
        sails.log.debug('Created itinerary object: ' + JSON.stringify(itinObj))
        return callback(null, itinObj)
      }],
      makeLivePricingApiRequest: ['createSessionObject', 'createItineraryObject', function (callback, results) {
        const sessionObj = results.createSessionObject
        const itinObj = results.createItineraryObject

        // Use SkyScannerFlightService to make the request
        SkyScannerFlightService.makeLivePricingPollRequest(sessionObj, itinObj).then(function (result) {
          return callback(null, {result,
            itinObj
          });
        }).catch(function (error) {
          sails.log.error(error)
          error.errorType = 'livePricingApiRequest'
          return callback(error, null)
        })
      }],
      getGettyImages: ['makeLivePricingApiRequest', function (callback, results) {
        const itinObj = results.makeLivePricingApiRequest.itinObj;

      GettyImagesService.searchAndRetrieveUrls({
        phrase: req.body.destination.name + ' city skyline',
        page: 1,
        pageSize: 100
      }).then(function (data) {
   
          var arr = []
          for (var i = 0; i < itinObj.pagesize && data.length; i++) {
            arr.push({
              name: 'image-' + i,
              image: (data[i] && data[i].displaySizeImage) || ''
            })
          }
          return callback(null, {data:arr, 
            gettyimagespageindex: 1,
            gettyimagespagesize:100
          })
        }).catch(function (err) {
          sails.log.error(err)
          err.errorType = 'gettyImageServiceRequest'
          return callback(err, null)
        })
      }]
    }, function (err, results) {
      if (err) {
        return res.json(ResponseStatus.OK, { status: ResponseStatus.CLIENT_BAD_REQUEST,
        errors: err, errorType: err.errorType || 'Unknown' })
      }else {
        return res.json(ResponseStatus.OK, { status: 200,
          result: results.makeLivePricingApiRequest.result,
          itinerary: results.makeLivePricingApiRequest.itinObj,
          cityImages: results.getGettyImages.data,
          gettyimagespageindex:results.getGettyImages.gettyimagespageindex,
          gettyimagespagesize:results.getGettyImages.gettyimagespagesize
        })
      }
    })
  },
  pollSkyScannerFlightLivePricingApi(req, res) {
    if (!req.param('urlEndPoint'))
      return res.json(ResponseStatus.CLIENT_BAD_REQUEST, {status: ResponseStatus.CLIENT_BAD_REQUEST,
      errors: ['No url end point specified']})

    const urlEndPoint = req.param('urlEndPoint')
    const newPageIndex = req.param('newskyscannerpageindex')
    const newGettyPageIndex = req.param('newgettyimagespageindex');
    const gettyImagesPageSize = req.param('gettyimagespagesize');
    const skyscannerPageSize = req.param('skyscannerpagesize');

    sails.log.debug(JSON.stringify(req.allParams()))

    const itinObj = SkyScannerFlightService.getDefaultItinObject()
    itinObj.pageindex = newPageIndex;
    itinObj.pagesize = skyscannerPageSize;

    GettyImagesService.searchAndRetrieveUrls({
      phrase: req.param('destinationName') + ' city skyline',
      page: newGettyPageIndex || 1,
    }).then(function (data) {

      const start = (newPageIndex * skyscannerPageSize) % gettyImagesPageSize
      const end = start + skyscannerPageSize

      var arr = []
      for (var i = start; i < end && i < data.length; i++) {
            arr.push({
              name: 'image-' + i,
              image: (data[i] && data[i].displaySizeImage) || ''
            })
      }

      // Use SkyScannerFlightService to make the request
      SkyScannerFlightService.makeLivePricingPollRequest(null,
        itinObj, urlEndPoint).then(function (result) {
          return res.json(ResponseStatus.OK, { status: 200,
          result,
          itinerary:itinObj,
          cityImages: arr,
          gettyimagespageindex:newGettyPageIndex,
          gettyimagespagesize:gettyImagesPageSize
        })
      }).catch(function (error) {
        return res.json(ResponseStatus.OK, { status: ResponseStatus.CLIENT_BAD_REQUEST,errors: error,
        errorType: error.errorType || 'Unknown' })
      })
    }).catch(function (err) {
      sails.log.error(err)
      err.errorType = 'gettyImageServiceRequest'
      return callback(err, null)
    })
  },
  retrieveHotelInfo(req, res) {
    UserSettingsService.getUserCurrencyCodePreference(req).then(function (currencyCodepreference) {
      const hotelRequestObject = SkyScannerHotelService.getDefaultHotelRequestObject()
      const sessionObject = SkyScannerHotelService.getDefaultSessionObject()

      try {
        req.body.userLocation = req.param('userLocation')
        req.body.dates = req.param('dates')
        req.body.ticketInfo = req.param('ticketInfo')
        req.body.destination = req.param('destination')
        req.body.origin = req.param('origin')
      } catch (err) {
        sails.log.debug('Error parsing JSON in ListingsController.js/hotels')
        sails.log.error(err)
      }

      if (req.param('chosenItinerary')) {
        req.body.chosenItinerary = req.param('chosenItinerary')

        if (!req.session.itineraries)
          req.session.itineraries = []

        req.session.itineraries.push(req.body.chosenItinerary)
      }

      hotelRequestObject.city = req.body.destination.airportCityId
      sessionObject.market = req.body.destination.countryId; // req.body.userLocation.address.countryCode || req.body.origin.airportCountryId || req.body.userLocation.address.country || (req.user && req.user.address.country)
      sessionObject.currency = req.body.currencyCodePreference || currencyCodepreference || 'USD'
      sessionObject.locale = req.headers['accept-language']
      sessionObject.entityId = req.body.destination.airportPos.lat + ',' + req.body.destination.airportPos.lng + '-latlong'
      sessionObject.checkindate = (req.body.dates && req.body.dates.departure) || (new Date().toISOString().slice(0, 10))
      sessionObject.checkoutdate = (req.body.dates && req.body.dates.arrival) || null
      sessionObject.guests = parseInt(((req.body.ticketInfo && req.body.ticketInfo.numAdultTickets)) || 1) +
      parseInt(((req.body.ticketInfo && req.body.ticketInfo.numChildTickets)) || 0) +
      parseInt(((req.body.ticketInfo && req.body.ticketInfo.numInfantTickets) || 0))
      sessionObject.rooms = req.body.numRooms || 1

      sails.log.debug('Created hotels session object : ' + JSON.stringify(sessionObject))

      SkyScannerHotelService.createSession(sessionObject).then(function (result) {
        return res.json({ result: result.body, nextPollUrl: result.url })
      }).catch(function (err) {
        sails.log.debug('Error in ListingsController.js/hotels')
        sails.log.error(err)
        sails.log.debug(err.error)
        sails.log.debug(JSON.stringify(error))
        return res.json(ResponseStatus.SERVER_ERROR, {})
      })
    })
  }
}
