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
    }
}