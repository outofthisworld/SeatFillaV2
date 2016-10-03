//Request module for sending and recieving API requests
const request = require('request');
//Used to encode form data
const querystring = require('querystring');
//Error utils for more details errors
const ErrorUtils = require('./../utils').ErrorUtils;
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
    getHotelSortOrders: function() { return Object.create() },
    createPriceFilterString: function(min, max) { return min + '-' + max },
    createSession(obj) {
        return new Promise((resolve, reject) => {

            if (!obj) return reject(new Error('Invalid object supplied to createSession in SkyScannerHotelService.js: ' + arguments.toString()));

            obj.apiKey = apiKey;


            const queryString = querystring.stringify(obj);
            const contentLength = sendData.length;
            const _this = this;

            request({
                headers: {
                    'Accept': 'application/json',
                    'Content-Length': contentLength
                },
                uri: urlEndpoint + '?' + (queryString || ''),
                method: 'GET'
            }, function(err, res, body) {
                if (err) return reject(err);
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
            price: null,
            city: null,
            district: null, //CSV of IDs; 'list' for possible IDs
            sortOrder: hotelSortOrders.ASC,
            sortColumn: hotelSortColumns.Rating
        }
    },
    getDefaultHotelDetailsObject(){
        return {
            hotelIds:[]
        }
    }
}