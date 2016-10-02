module.exports = {
    airports(req, res) {
        return res.ok();
    },

    retrieveFlightInfo(req, res) {
        new Promise(function(resolve, reject) {
            if (req.user) {
                UserLocation.create({
                    user: req.user.id,
                    longitude: req.body.userLocation.coords.latitude,
                    latitude: req.body.userLocation.coords.longitude,
                    streetNumber: req.body.userLocation.address.streetNumber,
                    street: req.body.userLocation.address.street,
                    route: req.body.userLocation.address.route,
                    city: req.body.userLocation.address.city,
                    town: req.body.userLocation.address.town,
                    region: req.body.userLocation.address.region,
                    postalCode: req.body.userLocation.address.postalCode,
                    country: req.body.userLocation.address.country,
                    countryCode: req.body.userLocation.address.countryCode,
                    formattedAddress: req.body.userLocation.formattedAddress,
                    placeId: req.body.userLocation.placeId,
                    timeZoneId: req.body.userLocation.timezone.id,
                    timeZoneName: req.body.userLocation.timezone.name,
                    timeZoneAbbr: req.body.userLocation.timezone.abbr,
                    timeZoneDstOffset: req.body.userLocation.timezone.dstOffset,
                    timeZoneRawOffset: req.body.userLocation.timezone.rawOffset,
                }).then(function(addr) {
                    sails.log.debug('Succesfully created user location: ' + JSON.stringify(addr));
                }).catch(function(err) {
                    sails.log.debug('Could not create user location. Error occurred : ' + JSON.stringify(err));
                });
                UserSearch.create({
                    user: req.user.id,
                    originAirportName: req.body.origin.airportName,
                    originAirportCity: req.body.origin.name,
                    originAirportCityId: req.body.origin.airportCityId,
                    originAirportCountry: req.body.origin.countryName,
                    originAirportCountryCode: req.body.origin.countryId,
                    originAirportCurrency: req.body.origin.currency,
                    originAirportId: req.body.origin.airportId,
                    originAirportIataOrFaaCode: req.body.origin.iataCode,
                    originAirportIcaoCode: req.body.origin.IcaoCode,
                    originAirportLatitude: req.body.origin.airportPos.lat,
                    originAirportLongitude: req.body.origin.airportPos.lng,
                    originAirportContinent: req.body.origin.continentName,
                    originAirportContinentId: req.body.origin.continentId,
                    destinationAirportName: req.body.destination.airportName,
                    destinationAirportCity: req.body.destination.name,
                    destinationAirportCityId: req.body.destination.airportCityId,
                    destinationAirportCountry: req.body.destination.countryName,
                    destinationAirportCountryCode: req.body.destination.origincountryId,
                    destinationAirportCurrency: req.body.destination.currency,
                    destinationAirportId: req.body.destination.airportId,
                    destinationAirportIataOrFaaCode: req.body.destination.iataCode,
                    destinationAirportIcaoCode: req.body.destination.IcaoCode,
                    destinationAirportLatitude: req.body.destination.airportPos.lat,
                    destinationAirportLongitude: req.body.destination.airportPos.lng,
                    destinationAirportContinent: req.body.destination.continentName,
                    destinationAirportContinentId: req.body.destination.continentId
                }).then(function(userSearch) {
                    sails.log.debug('Succesfully created user search ' + JSON.stringify(userSearch));
                }).catch(function(err) {
                    sails.log.debug('Error creating user search ' + JSON.stringify(err));
                })
            } else {
                sails.log.debug('User not logged in .. not saving location or search');
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
                    return resolve(res.json(ResponseStatus.OK, { result: result, cityImages: arr }));
                }).catch(function(err) {
                    sails.log.error(err);
                    return reject(ResponseStatus.OK, { result: result, error: err, errorType: 'gettyImageServiceRequest' });
                });
            }).catch(function(error) {
                sails.log.error(error);
                return reject(res.json(ResponseStatus.OK, { errors: error.error, errorType: 'livePricingApiRequest' }));
            });

        });
    },
    test(req, res) {
        GettyImagesService.searchAndRetrieveUrls({
            phrase: 'Auckland city skyline',
            page: 1,
            pageSize: 20
        }).then(function(data) {
            sails.log.debug(data);

            var arr = [];

            for (var i = 0; i < 20; i++) {
                arr.push({
                    name: 'one',
                    image: data[i].displaySizeImage
                });
            }

            return res.json(arr);
        }).catch(function(err) {
            sails.log.debug(err);
            res.forbidden(err);
        });

    }
}