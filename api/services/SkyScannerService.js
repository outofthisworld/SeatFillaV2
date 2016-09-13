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
    locationschemas:['Iata', 'GeoNameCode', 'GeoNameId', 'Rnid', 'Sky'],
    //Cabin classes
    cabinclasses:['Economy', 'PremiumEconomy', 'Business', 'First'],

    //Retrieves the session key from sky scanner (handshake)
    obtainSessionKey(obj) {
        return new Promise((resolve,reject)=>{
        
            if (!obj) return reject(new Error('Invalid object supplied to obtainSessionKey: ' + arguments));

            if(obj.locationschema && locationschemas.indexOf(obj.locationscehma) === -1)
                return reject(new Error('Invalid location schema property supplied to obtain session key: ' + arguments));

            if(obj.cabinclasses && cabinclasses.indexOf(obj.cabinclasses) === -1)
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
    retrieveLocales(){

    },
    retrieveItin(urlEndpoint, obj) {
        return new Promise((resolve,reject)=>{
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
    makeLivePricingApiRequest(sessionKeyObj,itinObj){
        return new Promise((resolve,reject)=>{
            this.obtainSessionKey(sessionKeyObj).then((result)=>{
                const url = result.url;
                this.retrieveItin(url,itinObj).then((result)=>{
                    resolve(result);
                }).catch((err)=> reject(err));
            }).catch((err)=>reject(err))
        });
    }
}