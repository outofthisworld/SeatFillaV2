//Request module for sending and recieving API requests
const request = require('request');
//Used to encode form data
const querystring = require('querystring');

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
        const countryInfoEndpoint = 'https://restcountries.eu/rest/v1/alpha/' + countryCode;

        return new Promise(function(resolve, reject) {
            request({
                headers: {
                    'Accept-Language': 'en-US',
                },
                uri: countryInfoEndpoint,
                method: 'GET'
            }, function(err, res, body) {
                if (err || !body || res.statusCode != 200) {
                    sails.log.debug('Error retrieving country info from endpoint ' + countryInfoEndpoint);
                    sails.log.debug('Reponse code was' + res.statusCode);
                    sails.log.debug('Body content: ' + body);
                    sails.log.error(err);
                    return reject(err);
                } else {
                    try {
                        const obj = JSON.parse(body);

                        if (!obj) {
                            console.log(obj);
                            return reject(new Error('Error with request to ' + gettyAuthEndpoint + ' could not parse body'));
                        } else {
                            return resolve(obj);
                        }
                    } catch (err) {
                        return reject(new Error('Error parsing JSON response when retrieving country info from rest countries endpoint ' + countryInfoEndpoint))
                    }
                }
            });
        });
    }
}