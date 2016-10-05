//Request module for sending and recieving API requests
const request = require('request');
//Used to encode form data
const querystring = require('querystring');

//Making requests to SS.
const apiKey = sails.config.skyscanner.apiKey;

const hotelSortColumns = {
    Rating: 'rating',
    Name: 'name',
    Category: 'category',
    Location: 'location',
    Distance: 'distance',
    Price: 'price',
    Relevance: 'relevance'
}

const hotelSortOrders = {
    ASC: 'asc',
    DESC: 'desc'
}

const skyScannerUrlEndpoint = 'http://partners.api.skyscanner.net/apiservices/hotels/liveprices/v2/';

module.exports = {
    getHotelSortColumns: function() { return Object.create(hotelSortColumns) },
    getHotelSortOrders: function() { return Object.create(hotelSortOrders) },
    createPriceFilterString: function(min, max) { return min + '-' + max },
    createSession(obj) {
        return new Promise(function(resolve, reject) {

            if (!obj) return reject(new Error('Invalid params supplied to createSession in SkyScannerHotelService.js'));

            const pathString = _.values(obj).join('/');
            sails.log.debug('Path string : ' + pathString);
            const finalPath = skyScannerUrlEndpoint + (pathString || '') + '?apiKey=' + 'prtl6749387986743898559646983194';
            sails.log.debug('Final path' + finalPath);
            const _this = this;

            request({
                headers: {
                    'Accept': 'application/json',
                },
                uri: finalPath,
                method: 'GET'
            }, function(err, res, body) {
                if (err) return reject({ error: err });
                try {
                    const result = JSON.parse(res.body);

                    if (result.ValidationErrors) {
                        sails.log.error(new Error(result.ValidationErrors[0]));
                        sails.log.error(result.errors);
                        return reject({ error: result.ValidationErrors });
                    } else if (result.errors) {
                        sails.log.error(result.errors);
                        return reject({ error: result.errors });
                    } else if (res.statusCode != 200) {
                        const error = new Error('Invalid response code when creating new session in SkyScannerHotelServer.js: response was: ' + res.statusCode);
                        sails.log.error(error);
                        return reject({ error });
                    }

                    sails.log.debug('Next poll url: ' + res.headers.Location);
                    sails.log.debug('Hotel session body: ' + res.body);
                    return resolve({ body: result, url: res.headers.Location });
                } catch (err) {
                    sails.log.error(err);
                    return reject({ error: err });
                }
            });
        });
    },
    requestHotelDetails(urlEndPoint, obj) {
        return new Promise((resolve, reject) => {

            obj.apiKey = apiKey;

            //Encode the obj as a query string..
            const queryString = querystring.stringify(obj);

            const _this = this;
            var failCount = 0;
            request({
                headers: {
                    'Accept': 'application/json'
                },
                uri: urlEndPoint + '?' + (queryString || ''),
                method: 'GET'
            }, function(err, res, body) {
                if (err) return reject({ error: err });

                try {
                    const result = JSON.parse(body);

                    if (result.ValidationErrors) {
                        sails.log.error(new Error(result.ValidationErrors[0]));
                        return reject({ error: result.ValidationErrors });
                    } else if (res.statusCode != 200) {
                        const error = new Error('Invalid response code when creating new session in SkyScannerHotelServer.js: response was: ' + res.statusCode);
                        sails.log.error(error);
                        return reject({ error });
                    } else {
                        return resolve({ body: result, nextPollUrl: res.headers.Location || urlEndPoint });
                    }

                } catch (err) {
                    sails.log.error(err);
                    return reject({ error: err });
                }
            });
        });
    },
    getDefaultSessionObject() {
        return {
            market: '',
            currency: '',
            locale: '',
            entityId: '',
            checkindate: new Date().toISOString(),
            checkoutdate: '',
            guests: 1,
            rooms: 1
        }
    },
    getDefaultHotelRequestObject() {
        return {
            pageSize: 10,
            pageIndex: 0,
            imageLimit: 3,
            //price: null,
            //city: null,
            district: null, //CSV of IDs; 'list' for possible IDs
            sortOrder: hotelSortOrders.ASC,
            sortColumn: hotelSortColumns.Rating
        }
    },
    getDefaultHotelDetailsObject() {
        return {
            hotelIds: []
        }
    }
}