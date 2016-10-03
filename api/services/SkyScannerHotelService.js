//Request module for sending and recieving API requests
const request = require('request');
//Used to encode form data
const querystring = require('querystring');

//Making requests to SS.
const apiKey = sails.config.skyscanner.apiKey;

const skyScannerApiEndpoint = 'http://partners.api.skyscanner.net/apiservices/hotels/liveprices/v2/';

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

const exportObj = {
    getHotelSortColumns: function() { return Object.create(hotelSortColumns) },
    getHotelSortOrders: function() { return Object.create(hotelSortOrders) },
    createPriceFilterString: function(min, max) { return min + '-' + max },
    createSession(obj) {
        return new Promise((resolve, reject) => {

            if (!obj) return reject(new Error('Invalid params supplied to createSession in SkyScannerHotelService.js'));

            obj.apiKey = apiKey;

            const queryString = querystring.stringify(obj);
            const _this = this;

            request({
                headers: {
                    'Accept': 'application/json',
                },
                uri: skyScannerApiEndpoint + '?' + (queryString || ''),
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
                        return resolve({ url: res.headers.location });
                    }
                } catch (err) {
                    sails.log.error(err);
                    return reject({ error: err });
                }
            });
        });
    },
    requestHotelDetails(urlEndPoint, obj) {
        return new Promise((resolve, reject) => {
            if (!sessionKey || !urlEndpoint) {
                return reject(new Error('Invalid parameters when calling retrieve itin '));
            }
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
    initiateFirstSession(sessionObj, hotelRequestObj) {
        const _self = this;
        return new Promise(function(resolve, reject) {
            _self.createSession(sessionObj).then(function(response) {
                const nextPollUrl = response.url;
                _self.requestHotelDetails(nextPollUrl, hotelRequestObj).then(function(result) {
                    return resolve(result);
                }).catch(function(err) {
                    sails.log.error(err);
                    return reject(err);
                })
            }).catch(function(err) {
                sails.log.error(err);
                return reject(err);
            })
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
            price: null,
            city: null,
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

module.exports = exportObj;