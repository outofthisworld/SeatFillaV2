module.exports = {
    airports(req, res) {
        return res.ok();
    },

    /*
        //req.body.destination example
        data {"Name":"Sydney Bankstown",
              "City":"Sydney",
              "Country":"Australia",
              "IataOrFaaCode":"BWU",
              "IcaoCode":"YSBK",
              "Latitude":-33.924444,
              "Longitude":150.988333,
              "Altitude":29,"Timezone":
              "Australia/Sydney",
              "DST":"O"
            }

       //req.body.arrival example
        data {"Name":"Sydney Bankstown",
              "City":"Sydney",
              "Country":"Australia",
              "IataOrFaaCode":"BWU",
              "IcaoCode":"YSBK",
              "Latitude":-33.924444,
              "Longitude":150.988333,
              "Altitude":29,"Timezone":
              "Australia/Sydney",
              "DST":"O"
            }
        
            //req.body.location
            user location: {"coords":{"latitude":-36.7835812,
            "longitude":174.462987,
            "altitude":null,
            "accuracy":30,
            "altitudeAccuracy":null,
            "heading":null,"speed":null},
            "address":{
                "commonName":"",
                "streetNumber":"117",
                "street":"Mahana Road",
                "route":"Mahana Road",
                "neighborhood":"",
                "town":"",
                "city":"Waimauku",
                "region":"Auckland",
                "postalCode":"0881",
                "state":"","stateCode":"",
                "country":"New Zealand",
                "countryCode":"NZ"},
                "formattedAddress":"117 Mahana Rd, Waimauku 0881, New Zealand",
                "type":"ROOFTOP","placeId":"ChIJ2z3AlvUSDW0RdDxZXdsqHn0",
                "timestamp":1474950287342,
                "flag":"//cdnjs.cloudflare.com/ajax/libs/flag-icon-css/2.3.1/flags/4x3/nz.svg",
                "timezone":{
                    "id":"Pacific/Auckland",
                    "name":"New Zealand Daylight Time",
                    "abbr":"NZDT",
                    "dstOffset":3600,"rawOffset":43200
                }
            }

              origin: originAirport,
                        destination: data,
                        userPosition: sf_map.position,
                        userLocation: sf_map.location,
                        userLocale: window.seatfilla.globals.getFirstBrowserLanguage(),
                        ticketInfo: { numAdultTickets, numChildTickets, numInfantTickets },
                        dateInfo: { departure, arrival }

            
                
                This is the information sent from our map...*
                
                {
                    
                "origin":{"Name":"Auckland Intl","City":"","Country":"","IataOrFaaCode"
                :"AKL","IcaoCode":"NZAA","Latitude":"","Longitude":"","Altitude":"23","Timezone":"Pacific/Auckland","D
                ST":"Z"},
                
                "destination":{"Name":"Sydney Bankstown","City":"Sydney","Country":"Australia","IataOrFaaCode":"BWU","IcaoCode":"
                YSBK","Latitude":"-33.924444","Longitude":"150.988333","Altitude":"29","Timezone":"Australia/Sydney","DST":"O"},
                
                "destinationAirportLocation":{"coords":{"latitude":"-33.9243756","longitude":"150.9877047"},"address":{"commonName":"","streetNumber
                ":"45L","street":"Starkey Drive","route":"Starkey Drive","neighborhood":"","town":"Bankstown City Council","city":"Banksto
                wn Aerodrome","region":"Bankstown City Council","postalCode":"2198","state":"","stateCode":"","country":"Australia","count
                ryCode":"AU"},"formattedAddress":"45L Starkey Dr, Bankstown Aerodrome NSW 2198, Australia","type":"ROOFTOP","placeId":"ChI
                JAdDoHnC-EmsRFWCT7iKf_hE","timestamp":"1474966127767","flag":"//cdnjs.cloudflare.com/ajax/libs/flag-icon-css/2.3.1/flags/4
                x3/au.svg"},
                
                "originAirportLocation":{"coords":{"latitude":"-37.00640569999999","longitude":"174.7909958"},"address":{"comm
                onName":"","streetNumber":"2","street":"Andrew Mckee Avenue","route":"Andrew Mckee Avenue","neighborhood":"","town":"","ci
                ty":"Auckland","region":"Auckland","postalCode":"2022","state":"","stateCode":"","country":"New Zealand","countryCode":"NZ
                "},"formattedAddress":"2 Andrew Mckee Ave, Auckland Airport, Auckland 2022, New Zealand","type":"ROOFTOP","placeId":"ChIJF
                xK70uZPDW0Rarh_m5lVv3A","timestamp":"1474966127989","flag":"//cdnjs.cloudflare.com/ajax/libs/flag-icon-css/2.3.1/flags/4x3
                /nz.svg"},
                
                "userLocation":{"coords":{"latitude":"","longitude":"","altitude":"","accuracy":"30","altit
                udeAccuracy":"","heading":"","speed":""},"address":{"commonName":"","streetNumber":"","street":"","route":"","neighborhood":"","town":"","city":"","region":"","postalCode":"","state":"","stateCode":"
                ","country":"","countryCode":""},"formattedAddress":"","type":"ROOFT
                OP","placeId":"ChIJ2z3AlvUSDW0RdDxZXdsqHn0","timestamp":"1474950287342","flag":"//cdnjs.cloudflare.com/ajax/libs/flag-icon
                -css/2.3.1/flags/4x3/nz.svg","timezone":{"id":"Pacific/Auckland","name":"New Zealand Daylight Time","abbr":"NZDT","dstOffs
                et":"3600","rawOffset":"43200"}},
                
                "userLocale":"en-US"
                }  
    */
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

            itinObj.pageindex = 0 || req.body.pageIndex;
            itinObj.pagesize = 10 || req.body.pageSize;

            sails.log.debug('Created itinerary object: ' + JSON.stringify(itinObj));

            //Use SkyScannerFlightService to make the request
            SkyScannerFlightService.makeLivePricingApiRequest(obj, itinObj).then(function(result) {
                GettyImagesService.searchAndRetrieveUrls({
                    phrase: req.body.destination.name + ' city skyline',
                    page: 1,
                    pageSize: result.Itineraries.length
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
                    sails.log.debug(err.message + ' ' + JSON.stringify(err));
                    return reject(ResponseStatus.OK, { result: result, error: err , errorType:'gettyImageServiceRequest' });
                });
            }).catch(function(error) {
                sails.log.debug('Error in maps controller ' + JSON.stringify(error));
                return reject(res.json(ResponseStatus.OK, { errors: error.error, errorType:'livePricingApiRequest' }));
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