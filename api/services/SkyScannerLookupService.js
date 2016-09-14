//Request module for sending and recieving API requests
const request = require('request');
//Used to encode form data
const querystring = require('querystring');
//Error utils for more details errors
const { ErrorUtils } = require('./../utils');
//Making requests to SS.
const apiKey = sails.config.skyscanner.apiKey;

module.exports = {
    //Gets sky scanners supported countries via locale
    getSkyScannerSupportedCountries(locale) {
        return new Promise((resolve,reject)=>{
             const endPoint = 'http://partners.api.skyscanner.net/apiservices/reference/v1.0/countries/' + locale + '?' + apiKey;

            request({
                headers: {
                    'Accept': 'application/json'
                },
                uri: endPoint,
                method: 'GET'
            },
            function(err, res, body) {
                if (err) return reject(ErrorUtils.createNewError('Invalid parameters when calling retrieve itin', arguments, err))
                else return resolve(res.body);
            });
         });
    }
    
}