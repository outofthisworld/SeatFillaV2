//Request module for sending and recieving API requests
const request = require('request');
//Used to encode form data
const querystring = require('querystring');
//Error utils for more details errors
const { ErrorUtils } = require('./../utils');
//Making requests to SS.
const apiKey = sails.config.skyscanner.apiKey;
//The end point for obtaining supported countries
const supportedCountriesApiEndPoint = 'http://partners.api.skyscanner.net/apiservices/reference/v1.0/countries/';

module.exports = {
    //Gets sky scanners supported countries via locale
    getSkyScannerSupportedCountries(locale) {
        return new Promise((resolve, reject) => {
            const endPoint =  supportedCountriesApiEndPoint + locale + '?' + apiKey;

            request({
                    headers: {
                        'Accept': 'application/json'
                    },
                    uri: endPoint,
                    method: 'GET'
                },
                function(err, res, body) {
                    if (err) return reject(ErrorUtils.createNewError('Error in response when calling getSkyScannerSuportedCountries', arguments, err))
                    else return resolve(res.body);
                });
        });
    },
    //Get the ISO 3166-1 2 letter country code for a specific locale and country name
    getIsoCountryCode(locale,countryName){
        return getSkyScannerSupportedCountries(locale)
        .then((result)=>{
            return result.Countries.filter((element)=>{
                return element.Name === countryName;
            }).map((filteredElement)=>{
                return filteredElement.Code;
            })
        })
    }
}