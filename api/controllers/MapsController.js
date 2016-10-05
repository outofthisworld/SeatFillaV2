module.exports = {
    airports(req, res) {
        return res.ok();
    },
    retrieveFlightInfo(req, res) {
        new Promise(function(resolve, reject) {
            if (req.user) {
                UserLocationService.createNewUserLocation(req.user, req.body.userLocation).then(function(addr) {
                    sails.log.debug('Succesfully created user location: ' + JSON.stringify(addr));
                }).catch(function(err) {
                    sails.log.error(err);
                });

                UserSearchService.newUserMapSearch(
                    req.user,
                    req.body.origin,
                    req.body.destination).then(function(userSearch) {
                    sails.log.debug('Succesfully created user search ' + JSON.stringify(userSearch));
                }).catch(function(err) {
                    sails.log.debug('Error creating user search ' + JSON.stringify(err));
                });
            }

            const obj = Object.create(SkyScannerFlightService.sessionObj);

            obj.country = req.body.userLocation.address.countryCode || req.body.origin.airportCountryId || req.body.userLocation.address.country || (req.user && req.user.address.country);
            obj.currency = req.body.prefferedCurrency || UserSettingsService.getUserCurrencyCodePreference(req);
            obj.locale = req.headers['accept-language'];
            obj.originplace = req.body.origin.iataCode;
            obj.destinationplace = req.body.destination.iataCode;
            obj.outbounddate = (req.body.dates && req.body.dates.departure) || (new Date().toISOString().slice(0, 10));
            obj.inbounddate = (req.body.dates && req.body.dates.arrival) || null;
            obj.locationschema = SkyScannerFlightService.locationschemas.Iata;
            obj.cabinclass = SkyScannerFlightService.cabinclasses[req.body.prefferedCabinClass] || SkyScannerFlightService.cabinclasses.Economy;
            obj.adults = (req.body.ticketInfo && req.body.ticketInfo.numAdultTickets) || 1;
            obj.children = (req.body.ticketInfo && req.body.ticketInfo.numChildTickets) || 0;
            obj.infants = (req.body.ticketInfo && req.body.ticketInfo.numInfantTickets) || 0;
            obj.groupPricing = req.body.groupPricing || false;

            sails.log.debug('Created session object: ' + JSON.stringify(obj));

            const itinObj = Object.create(SkyScannerFlightService.itinObj);

            sails.log.debug('Created itinerary object: ' + JSON.stringify(itinObj));

            //Use SkyScannerFlightService to make the request
            SkyScannerFlightService.makeLivePricingApiRequest(obj, itinObj).then(function(result) {
                GettyImagesService.searchAndRetrieveUrls({
                    phrase: req.body.destination.name + ' city skyline',
                    page: 1,
                    pageSize: result.Itineraries.length > 100 ? result.Itineraries.length : 100
                }).then(function(data) {
                    sails.log.debug('image data- ' + data);

                    var arr = [];

                    for (var i = 0; i < result.Itineraries.length && data.length; i++) {
                        arr.push({
                            name: 'image-' + i,
                            image: (data[i] && data[i].displaySizeImage) || ''
                        });
                    }

                    sails.log.debug(result);
                    return resolve(res.json(ResponseStatus.OK, { result, cityImages: arr }));
                }).catch(function(err) {
                    sails.log.error(err);
                    return reject(ResponseStatus.OK, { result, error: err, errorType: 'gettyImageServiceRequest' });
                });
            }).catch(function(error) {
                sails.log.error(error);
                return reject(res.json(ResponseStatus.OK, { errors: error.error, errorType: 'livePricingApiRequest' }));
            });
        });
    },
    retrieveHotelInfo(req, res) {
        const hotelRequestObject = SkyScannerHotelService.getDefaultHotelRequestObject();
        const sessionObject = SkyScannerHotelService.getDefaultSessionObject();

        try {
            req.body.userLocation = req.param('userLocation');
            req.body.dates = req.param('dates');
            req.body.ticketInfo = req.param('ticketInfo');
            req.body.destination = req.param('destination');
            req.body.origin = req.param('origin');
        } catch (err) {
            sails.log.debug('Error parsing JSON in ListingsController.js/hotels');
            sails.log.error(err);
        }

        if (req.param('chosenItinerary')) {
            req.body.chosenItinerary = req.param('chosenItinerary');

            if (!req.session.itineraries)
                req.session.itineraries = [];

            req.session.itineraries.push(req.body.chosenItinerary);
        }

        hotelRequestObject.city = req.body.destination.airportCityId;
        sessionObject.market = req.body.destination.countryId; //req.body.userLocation.address.countryCode || req.body.origin.airportCountryId || req.body.userLocation.address.country || (req.user && req.user.address.country);
        sessionObject.currency = req.body.prefferedCurrency || UserSettingsService.getUserCurrencyCodePreference(req);
        sessionObject.locale = req.headers['accept-language'];
        sessionObject.entityId = req.body.destination.airportPos.lat + ',' + req.body.destination.airportPos.lng + '-latlong';
        sessionObject.checkindate = (req.body.dates && req.body.dates.departure) || (new Date().toISOString().slice(0, 10));
        sessionObject.checkoutdate = (req.body.dates && req.body.dates.arrival) || null;
        sessionObject.guests = parseInt(((req.body.ticketInfo && req.body.ticketInfo.numAdultTickets)) || 1) +
            parseInt(((req.body.ticketInfo && req.body.ticketInfo.numChildTickets)) || 0) +
            parseInt(((req.body.ticketInfo && req.body.ticketInfo.numInfantTickets) || 0));
        sessionObject.rooms = req.body.numRooms || 1;

        sails.log.debug('Created hotels session object : ' + JSON.stringify(sessionObject));

        SkyScannerHotelService.createSession(sessionObject).then(function(result) {
            return res.json({ result: result.body, nextPollUrl: result.url });
        }).catch(function(err) {
            sails.log.debug('Error in ListingsController.js/hotels');
            sails.log.error(err);
            sails.log.debug(err.error);
            sails.log.debug(JSON.stringify(error));
            return res.json(ResponseStatus.SERVER_ERROR, {});
        });
    }
}