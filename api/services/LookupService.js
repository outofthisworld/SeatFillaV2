/*
    Module to perform lookups to disparate external services.

    Some of these methods should be updated in the future to provide more generic versions of them, as they operate
    in similar ways.

    Created by Dale.
*/

const request = require('request')
const querystring = require('querystring')
const GlobalCache = require('../utils/GlobalCache')

module.exports = {
  /*
      The below function retrieves information about a country via the countries ISO country code.

      An example response looks like the following:
      {
          "name": "Colombia",
          "topLevelDomain": [
              ".co"
          ],
          "alpha2Code": "CO",
          "alpha3Code": "COL",
          "callingCodes": [
              "57"
          ],
          "capital": "Bogotá",
          "altSpellings": [
              "CO",
              "Republic of Colombia",
              "República de Colombia"
          ],
          "relevance": "0",
          "region": "Americas",
          "subregion": "South America",
          "translations": {
              "de": "Kolumbien",
              "es": "Colombia",
              "fr": "Colombie",
              "ja": "コロンビア",
              "it": "Colombia"
          },
          "population": 48266600,
          "latlng": [
              4,
              -72
          ],
          "demonym": "Colombian",
          "area": 1141748,
          "gini": 55.9,
          "timezones": [
              "UTC-05:00"
          ],
          "borders": [
              "BRA",
              "ECU",
              "PAN",
              "PER",
              "VEN"
          ],
          "nativeName": "Colombia",
          "numericCode": "170",
          "currencies": [
              "COP"
          ],
          "languages": [
              "es"
          ]
      }
  */
  rest_countries_get_country_info(countryCode) {
    if (!countryCode) throw new Error('Invalid params to LookupService.js/rest_countries_get_country_info')

    const countryInfoEndpoint = 'https://restcountries.eu/rest/v1/alpha/' + countryCode

    return new Promise(function (resolve, reject) {
      const countryData = GlobalCache({
        GlobalCache: 'rest_countries_cache'
      }).getData(countryCode)

      if (countryData) {
        resolve(countryData)
      } else {
        request({
          headers: {
            'Accept-Language': 'en-US'
          },
          uri: countryInfoEndpoint,
          method: 'GET'
        }, function (err, res, body) {
          if (err || !body || res.statusCode != 200) {
            sails.log.debug('Error retrieving country info from endpoint ' + countryInfoEndpoint)
            sails.log.debug('Reponse code was' + res.statusCode)
            sails.log.debug('Body content: ' + body)
            sails.log.error(err)
            return reject(err)
          } else {
            try {
              const obj = JSON.parse(body)

              if (!obj) {
                console.log(obj)
                return reject(new Error('Error with request to ' + countryInfoEndpoint + ' could not parse body'))
              } else {
                GlobalCache({
                  GlobalCache: 'rest_countries_cache'
                }).insertData(countryCode, obj)
                return resolve(obj)
              }
            } catch (err) {
              return reject(new Error('Error parsing JSON response when retrieving country info from rest countries endpoint ' + countryInfoEndpoint))
            }
          }
        })
      }
    })
  },
  /*
      The following function current currency exchange rates for the specified base currency.
      {
      "base":"USD","date":"2016-10-07",
      "rates":{"AUD":1.3192,
      "BGN":1.7557,
      "BRL":3.2394,
      "CAD":1.3271,
      "CHF":0.98259,
      "CNY":6.6716,
      "CZK":24.256,
      "DKK":6.6791,
      "GBP":0.81107,
      "HKD":7.7582,
      "HRK":6.7356,
      "HUF":272.76,
      "IDR":12986.0,
      "ILS":3.7984,
      "INR":66.706,
      "JPY":103.63,
      "KRW":1115.8,
      "MXN":19.354,
      "MYR":4.1601,
      "NOK":8.0799,
      "NZD":1.3995,
      "PHP":48.369,
      "PLN":3.8432,
      "RON":4.0436,
      "RUB":62.45,
      "SEK":8.6477,
      "SGD":1.3752,
      "THB":34.91,
      "TRY":3.0507,
      "ZAR":13.881,
      "EUR":0.89767
      }
   }
  */
  fixer_io_get_exchange_rates(base) {
    if (!base) throw new Error('Invalid params to LookupService.js/rest_countries_get_country_info')

    const fixerIoEndpoint = 'http://api.fixer.io/latest?base=' + base

    return new Promise(function (resolve, reject) {
      const cachedData = GlobalCache({
        GlobalCache: 'fixer_io_exchange_rates'
      }).getData(base)

      if (cachedData) {
        return resolve(cachedData)
      } else {
        request({
          headers: {
            'Accept-Language': 'en-US'
          },
          uri: fixerIoEndpoint,
          method: 'GET'
        }, function (err, res, body) {
          if (err || !body || res.statusCode != 200) {
            sails.log.debug('Error retrieving country info from endpoint ' + fixerIoEndpoint)
            sails.log.debug('Reponse code was' + res.statusCode)
            sails.log.debug('Body content: ' + body)
            sails.log.error(err)
            return reject(err)
          } else {
            try {
              const obj = JSON.parse(body)

              if (!obj) {
                console.log(obj)
                return reject(new Error('Error with request to ' + fixerIoEndpoint + ' could not parse body'))
              } else {
                GlobalCache({
                  GlobalCache: 'fixer_io_exchange_rates'
                }).insertData(base, obj)
                return resolve(obj)
              }
            } catch (err) {
              return reject(new Error('Error parsing JSON response when retrieving country info from rest countries endpoint ' + countryInfoEndpoint))
            }
          }
        })
      }
    })
  }
}
