/*
    Module for integrating the website with GettyImages who provide free stock photos
    for non-commercial purposes based on search queries.

    Created by Dale.

    See https://api.gettyimages.com/ for more details.

*/


//Request module for sending and recieving API requests
const request = require('request');
//Used to encode form data
const querystring = require('querystring');


const sandBoxApiKey = 'f98wrt5y3p4234r5vecuuf8c';
const sandBoxSecret = 'rf6Wua5AKXMzgEWHbynZQa5WrqrDwe9sQeDD8A42aP8S5';

const embededApiKey = 'uqdsewc7gn79apjzdmd7qkya';
const embededSecret = '3QUvputDkf5UqzWNsA8EhwNfGVGA2GDRW6N6kXEFXXjkt';

const gettyAuthEndpoint = 'https://api.gettyimages.com/oauth2/token/';

var token = null;
var tokenRequestTime = null;
var tokenExpiraryTime = 1800; //In seconds


module.exports = {
    getToken() {
        return new Promise((resolve, reject) => {
            if (token && tokenRequestTime && ((new Date().getTime() - tokenRequestTime) / 1000) <
                (tokenExpiraryTime - 120)) {
                console.log('resolving token');
                return resolve(token);
            }

            tokenRequestTime = new Date().getTime();
            //Make the request

            /*
                POST /token HTTPS/1.1
                Host: api.gettyimages.com/oauth2/token/
                Content-Type: application/x-www-form-urlencoded

                client_id=TestClientId&client_secret=TestSecret&grant_type=client_credentials
            */

            const requestObject = {
                "grant_type": 'client_credentials',
                "client_id": embededApiKey,
                "client_secret": embededSecret
            }

            const sendData = querystring.stringify(requestObject);

            request({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Api-Key': sandBoxApiKey,
                    'Accept-Language': 'en-US'
                },
                uri: gettyAuthEndpoint,
                body: sendData,
                method: 'POST'
            }, function(err, res, body) {
                if (err) {
                    return reject(err);
                } else {
                    token = res.body['access_token'];
                    return resolve(res.body);
                }
            });
        });
    },
    makeImagesRequest(options) {
        return this.getToken().then(function(result) {
            if (!options) return Promise.reject(result);

            result = JSON.parse(result);

            const tokenType = result['token_type'];
            const authToken = result['access_token'];

            const reqObject = {
                phrase: options.phrase,
                page: options.page,
                page_size: options.pageSize,
                exclude_nudity: true,
                embed_content_only: options['embed_content_only'] || true
            }

            const sendData = querystring.stringify(reqObject);

            return new Promise((resolve, reject) => {
                request({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Api-Key': embededApiKey,
                        'Accept-Language': 'en-US',
                        'Authorization': 'Bearer' + ' ' + authToken
                    },
                    uri: 'https://api.gettyimages.com/v3/search/images?' + sendData,
                    method: 'GET'
                }, function(err, res, body) {

                    if (err || !body) {
                        return reject(err);
                    } else {
                        const obj = JSON.parse(body);

                        if (!obj) {
                            console.log(obj);
                            return reject(new Error('Error with request to ' + gettyAuthEndpoint + ' could not parse body'));
                        } else if (obj.ErrorCode) {
                            return reject(new Error('Error with request to ' + gettyAuthEndpoint + JSON.stringify(obj)))
                        }

                        return resolve(obj);
                    }
                });
            });
        });
    },
    searchImages(phrase, pageNumber, numberOfImages) {
        if (!keywords) throw new Error('Invalid parameters to GettyImagesService.js searchImages');
        return this.makeImagesRequest({
            phrase,
            page: pageNumber || 1,
            pageSize: numberOfImages || 20
        });
    },
    searchAndRetrieveUrls(options) {
        return new Promise((resolve, reject) => {
            this.makeImagesRequest(options).then(function(res) {
                if (res && res.images) {
                    //console.log(JSON.stringify(res));
                    resolve(res.images.map(function(image) {
                        return { embededImage: image['uri_oembed'], displaySizeImage: image['display_sizes'][0].uri };
                    }));
                } else {
                    reject(new Error('Could not obtain response'));
                }
            }).catch(function(err) {
                reject(err);
            });
        });
    }
}