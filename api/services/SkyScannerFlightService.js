//Request module for sending and recieving API requests
const request = require('request');
//Used to encode form data
const querystring = require('querystring');

module.exports = {
    //Api endpoint
    skyScannerApiEndPoint: 'http://partners.api.skyscanner.net/apiservices/pricing/v1.0',
    //Api key
    apiKey: 'ri875778577970785652401867130811',
    //Location schema
    locationschemas: { Iata: 'Iata', GeoNameCode: 'GeoNameCode', GeoNameId: 'GeoNameId', Rnid: 'Rnid', Sky: 'Sky' },
    //Cabin classes
    cabinclasses: { Economy: 'Economy', PremiumEconomy: 'PremiumEconomy', Business: 'Business', First: 'First' },
    //The carrier schemas
    carrierschemas: { Iata: 'Iata', Icao: 'Icao', Skyscanner: 'Skyscanner' },
    //Sort itin by...
    sorttypes: {
        carrier: 'carrier',
        duration: 'duration',
        outboundarrivetime: 'outboundarrivetime',
        outbounddeparttime: 'outbounddeparttime',
        inboundarrivetime: 'inboundarrivetime',
        inbounddeparttime: 'inbounddeparttime',
        price: 'price'
    },
    //Sort asc desc..             
    sortorders: {
        asc: 'asc',
        desc: 'desc'
    },
    //Morning, afternoon, evening
    maxduration: 1800,
    departtimes: ['M', 'A', 'E'],
    sessionObj: {
        country: 'ISO country code',
        currency: 'ISO currency code/currencies service',
        locale: 'ISO locale code (language and country)/Locales Service',
        originplace: 'Origin City/Airport as specified in location schema',
        destinationplace: 'Dest City/Airport as specified in location schema',
        outbounddate: 'YY-mm-dd',
        inbounddate: 'YY-mm-dd',
        locationschema: this.locationschemas.Rnid,
        cabinclass: this.cabinclasses.Economy,
        adults: 1,
        children: 0,
        infants: 0,
        groupPricing: false
    },
    itinObj: {
        locationschema: this.locationschemas.Rnid, //location schema
        carrierschema: this.carrierschemas.Iata, // carrier schema
        sorttype: this.sorttypes.price,
        sortorder: this.sortorders.asc, // 'asc' || 'desc'
        originairports: null, //Filter outgoing airports delim by ';'
        destinationairports: null, //Filter incoming airports delim by ';'
        maxStops: 10, //Max number of stops
        outbounddeparttime: departtimes.join(';'),
        outbounddepartstarttime: null, //Start of depart time 'hh:mm'
        outbounddepartendtime: null, //End of depart time 'hh:mm'
        inbounddeparttime: departtimes.join(';'),
        inbounddepartstarttime: null, //Start of depart time 'hh:mm'
        inbounddepartendtime: null, //Start of depart time 'hh:mm'
        duration: this.maxduration, //Max flight duration
        includecarriers: null, //Iata carrier codes
        excludecarriers: null //Iata carrier codes
    },
    //Retrieves the session key from sky scanner (handshake)
    obtainSessionKey(obj) {
        return new Promise((resolve, reject) => {

            if (!obj) return reject(new Error('Invalid object supplied to obtainSessionKey: ' + arguments));

            if (obj.locationschema && locationschemas.indexOf(obj.locationscehma) === -1)
                return reject(new Error('Invalid location schema property supplied to obtain session key: ' + arguments));

            if (obj.cabinclasses && cabinclasses.indexOf(obj.cabinclasses) === -1)
                return reject(new Error('Invalid cabin class property supplied to obtain session key: ' + arguments));

            obj.apiKey = this.apiKey;
            const sendData = querystring.stringify(obj);
            const contentLength = sendData.length;

            request({
                headers: {
                    'Content-Length': contentLength,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                uri: this.skyScannerApiEndPoint,
                body: sendData,
                method: 'POST'
            }, function(err, res, body) {
                if (err) return reject(err)
                else return resolve({
                    url: res.headers.location
                });
            });
        });
    },
    retrieveCurrencies() {

    },
    retrieveLocales() {

    },
    retrieveItin(urlEndpoint, obj) {
        return new Promise((resolve, reject) => {
            if (!obj || !urlEndpoint) return
            reject(new Error('Invalid object supplied to retrieveItin: ' + arguments), null);

            if (!obj.apiKey)
                obj.apiKey = this.apiKey;

            let queryString = querystring.stringify(obj);
            request({
                headers: {
                    'Accept': 'application/json'
                },
                uri: urlEndpoint + '?' + (queryString || ''),
                method: 'GET'
            }, function(err, res, body) {
                if (err) return reject(err)
                else return resolve(res.body);
            });
        });
    },
    makeLivePricingApiRequest(sessionKeyObj, itinObj) {
        return new Promise((resolve, reject) => {
            this.obtainSessionKey(sessionKeyObj).then((result) => {
                const url = result.url;
                this.retrieveItin(url, itinObj).then((result) => {
                    resolve(result);
                }).catch((err) => reject(err));
            }).catch((err) => reject(err))
        });
    }
}