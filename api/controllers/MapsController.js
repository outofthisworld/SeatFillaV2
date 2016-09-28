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
            })

            UserSearch.create({
                user: req.user.id,
                originAirportName: req.body.origin.Name,
                originAirportCity: req.body.origin.City,
                originAirportCountry: req.body.origin.Country,
                originAirportCountryCode: req.body.originAirportLocation.address.countryCode,
                originAirportFormattedAddress: req.body.originAirportLocation.address.formattedAddress,
                originAirportIataOrFaaCode: req.body.origin.IataOrFaaCode,
                originAirportIcaoCode: req.body.origin.IcaoCode,
                originAirportLatitude: req.body.origin.Latitude,
                originAirportLongitude: req.body.origin.Longitude,
                originAirportTimezone: req.body.origin.Timezone,
                originAirportDst: req.body.origin.DST,
                destinationAirportName: req.body.destination.Name,
                destinationAirportCity: req.body.destination.City,
                destinationAirportCountry: req.body.destination.Country,
                destinationAirportCountryCode: req.body.destinationAirport.address.countryCode,
                destinationAirportFormattedAddress: req.body.destinationAirport.address.formattedAddress,
                destinationAirportIataOrFaaCode: req.body.destination.IataOrFaaCode,
                destinationAirportIcaoCode: req.body.destination.IcaoCode,
                destinationAirportLatitude: req.body.destination.Latitude,
                destinationAirportLongitude: req.body.destination.Longitude,
                destinationAirportTimezone: req.body.destination.Timezone,
                destinationAirportDst: req.body.destination.DST
            }).then(function(userSearch) {
                sails.log.debug('Succesfully created user search ' + JSON.stringify(userSearch));
            }).catch(function(err) {
                sails.log.debug('Error creating user search ' + JSON.stringify(err));
            })
        } else {
            sails.log.debug('User not logged in .. not saving location or search');
        }
        new Promise(function(resolve, reject) {
            const obj = Object.create(SkyScannerFlightService.sessionObj);

            obj.country = req.body.userLocation.address.countryCode || req.body.userLocation.address.country || (req.user && req.user.address.country);
            obj.currency = req.body.prefferedCurrency || UserSettingsService.getUserCurrencyCodePreference(req);
            obj.locale = req.body.userLocale == req.headers['accept-language'] ? req.body.userLocale : req.headers['accept-language'];
            obj.originplace = req.body.origin.IataOrFaaCode;
            obj.destinationplace = req.body.destination.IataOrFaaCode;
            obj.outbounddate = (req.body.dates && req.body.dates.departure) || (new Date().toISOString().slice(0, 10));
            obj.inbounddate = (req.body.dates && req.body.dates.arrival) || null;
            obj.locationschema = SkyScannerFlightService.locationschemas.Iata;
            obj.cabinclass = req.body.prefferedCabinClass || SkyScannerFlightService.cabinclasses.Economy;
            obj.adults = (req.body.ticketInfo && req.body.ticketInfo.numAdultTickets) || 1;
            obj.children = (req.body.ticketInfo && req.body.ticketInfo.numChildTickets) || 0;
            obj.infants = (req.body.ticketInfo && req.body.ticketInfo.numInfantTickets) || 0;
            obj.groupPricing = req.body.groupPricing || false;

            sails.log.debug('Created session object: ' + JSON.stringify(obj));

            const itinObj = Object.create(SkyScannerFlightService.itinObj);

            itinObj.pageindex = 0 || req.body.pageIndex;
            itinObj.pagesize = 10 || req.body.pageSize;

            sails.log.debug('Created itin object: ' + JSON.stringify(itinObj));

            //Use SkyScannerFlightService to make the request
            SkyScannerFlightService.makeLivePricingApiRequest(obj, itinObj).then(function(result) {
                sails.log.debug(result);
                return res.json(ResponseStatus.OK, { result: result });
            }).catch(function(error) {
                sails.log.debug('Error in maps controller ' + error.message + ' ' + JSON.stringify(error));
                return res.json(ResponseStatus.SERVER_ERROR, { error: error });
            });
        })
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