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
//The end point for obtaining supported currencies
const supportedCurrenciesApiEndPoint = 'http://partners.api.skyscanner.net/apiservices/reference/v1.0/currencies';
//The end point for obtaining supported locales
const supportedLocalesApiEndPoint = 'http://partners.api.skyscanner.net/apiservices/reference/v1.0/locales';

module.exports = {
    /*
     Gets sky scanners supported countries via locale.

     Code format:  ISO 3166-1

     EXAMPLE RESPONSE:
       {
        "Countries": [
            {
            "Code": "AD",
            "Name": "Andorra"
            }
         ]
       }

       This will method will return an array of objects with the following structure:
        {
            "Code": "AD",
            "Name": "Andorra"
        }

        Params:
        locale A valid ISO locale code.
    */
    getSupportedCountries(locale) {
        return new Promise((resolve, reject) => {
            const endPoint = supportedCountriesApiEndPoint + locale + '?apiKey=' + apiKey;

            request({
                    headers: {
                        'Accept': 'application/json'
                    },
                    uri: endPoint,
                    method: 'GET'
                },
                function(err, res, body) {
                    if (err) return reject(ErrorUtils.createNewError('Error in response when calling getSuportedCountries', arguments, err))
                    else return resolve(res.body.Countries);
                });
        });
    },
    /*
        A method which will obtain an ISO country code 
        using the specified locale and countryName.

        Params: 
        locale:  a valid ISO locale code.
        countryName: the country name in which the IsoCountryCode is needed
    */
    getIsoCountryCode(locale, countryName) {
        return getSupportedCountries(locale)
            .then((result) => {
                return result.filter((element) => {
                    return element.Name === countryName;
                }).map((filteredElement) => {
                    return filteredElement.Code;
                })
            })
    },
    /*
        Get the ISO 4217 currency codes supported by sky scanner

        EXAMPLE RESPONSE:
        <Currencies>
            <CurrencyDto>
            <Code>AED</Code>
            <Symbol>د.إ.‏</Symbol>
            <ThousandsSeparator>,</ThousandsSeparator>
            <DecimalSeparator>.</DecimalSeparator>
            <SymbolOnLeft>true</SymbolOnLeft>
            <SpaceBetweenAmountAndSymbol>true</SpaceBetweenAmountAndSymbol>
            <RoundingCoefficient>0</RoundingCoefficient>
            <DecimalDigits>2</DecimalDigits>
            </CurrencyDto>
        </Currencies>
    */
    getCurrencyCodes(){
        return new Promise((resolve,reject)=>{
            const endPoint = supportedCurrenciesApiEndPoint + '?apiKey=' + apiKey;
            request({
                    headers: {
                        'Accept': 'application/json'
                    },
                    uri: endPoint,
                    method: 'GET'
                },
                function(err, res, body) {
                    if (err) return reject(ErrorUtils.createNewError('Error in response when calling getCurrencyCodes', arguments, err))
                    else return resolve(res.body.Currencies);
            });
        });
    },
    /*
       Requests Locales from skyscanner.
       The Locale code is a combination of the standard ISO 639-1 code for the language and the ISO 3166-1 code for the country

        EXAMPLE RESPONSE:
        <Locales>
            <LocaleDto>
            <Code>ar-AE</Code>
            <Name>العربية (الإمارات العربية المتحدة)</Name>
            </LocaleDto>
        </Locales>
    */
    getLocales(){
            return new Promise((resolve,reject)=>{
                const endPoint = supportedLocalesApiEndPoint + '?apiKey=' + apiKey;
                request({
                        headers: {
                            'Accept': 'application/json'
                        },
                        uri: endPoint,
                        method: 'GET'
                    },
                    function(err, res, body) {
                        if (err) return reject(ErrorUtils.createNewError('Error in response when calling getCurrencyCodes', arguments, err))
                        else return resolve(res.body.Locales);
                });
        });
    }
}