module.exports = {
    airports(req, res) {
        return res.ok();
    },

    /*
        //req.body.mapdata
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
    */
    retrieveFlightInfo(req, res) {
        const obj = Object.create(SkyScannerFlightService.sessionObj);

        exportObj.sessionObj = {
            country: req.body.mapdata.country,
            currency: 'ISO currency code/currencies service',
            locale: req.param('Locale') || req.headers['accept-language'],
            originplace: '',
            destinationplace: req.mapdata.IataOrFaaCode,
            outbounddate: 'YY-mm-dd',
            inbounddate: 'YY-mm-dd',
            locationschema: SkyScannerFlightService.locationschemas.Iata,
            cabinclass: SkyScannerFlightService.cabinclasses.Economy,
            adults: 1,
            children: 0,
            infants: 0,
            groupPricing: false
        }
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