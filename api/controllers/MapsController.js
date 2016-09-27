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
    */
    retrieveFlightInfo(req, res) {
        new Promise(function(resolve, reject) {
            const obj = Object.create(SkyScannerFlightService.sessionObj);

            obj.country = req.body.userLocation.address.countryCode || req.body.userLocation.address.country;
            obj.currency = 'ISO currency code/currencies service';
            obj.locale = req.body.userLocale == req.headers['accept-language'] ? req.body.userLocale : req.headers['accept-language'];
            obj.originplace = req.body.origin.IataOrFaaCode;
            obj.destinationplace = req.body.destination.IataOrFaaCode;
            obj.outbounddate = req.body.dates.departure;
            obj.inbounddate = req.body.dates.arrival;
            obj.locationschema = SkyScannerFlightService.locationschemas.Iata;
            obj.cabinclass = SkyScannerFlightService.cabinclasses.Economy;
            obj.adults = req.body.ticketInfo.numAdultTickets || 1;
            obj.children = req.body.ticketInfo.numChildTickets || 0;
            obj.infants = req.body.ticketInfo.numInfantTickets || 0;
            obj.groupPricing = req.body.groupPricing || false;
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