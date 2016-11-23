/*
    Module for integrating the website with GettyImages who provide free stock photos
    for non-commercial purposes based on search queries.

    Created by Dale.

    See https://api.gettyimages.com/ for more details.

*/

// Request module for sending and recieving API requests
const request = require('request')
    // Used to encode form data
const querystring = require('querystring')

const GlobalCache = require('../utils/GlobalCache')

const sandBoxApiKey = 'f98wrt5y3p4234r5vecuuf8c'
const sandBoxSecret = 'rf6Wua5AKXMzgEWHbynZQa5WrqrDwe9sQeDD8A42aP8S5'

const embededApiKey = 'uqdsewc7gn79apjzdmd7qkya'
const embededSecret = '3QUvputDkf5UqzWNsA8EhwNfGVGA2GDRW6N6kXEFXXjkt'

const gettyAuthEndpoint = 'https://api.gettyimages.com/oauth2/token/'

var token = null
var tokenRequestTime = null
var tokenExpiraryTime = 1800 // In seconds

module.exports = {
    getToken() {
        return new Promise((resolve, reject) => {
            if (token && tokenRequestTime && ((new Date().getTime() - tokenRequestTime) / 1000) <
                (tokenExpiraryTime - 120)) {
                console.log('resolving token')
                return resolve(token)
            }

            tokenRequestTime = new Date().getTime()
                // Make the request

            /*
                POST /token HTTPS/1.1
                Host: api.gettyimages.com/oauth2/token/
                Content-Type: application/x-www-form-urlencoded

                client_id=TestClientId&client_secret=TestSecret&grant_type=client_credentials
            */

            const requestObject = {
                'grant_type': 'client_credentials',
                'client_id': embededApiKey,
                'client_secret': embededSecret
            }

            const sendData = querystring.stringify(requestObject)

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
                if (err || !body) {
                    return reject(err || new Error('Body response was empty'))
                } else {
                    try {
                        const result = JSON.parse(body)
                        token = result['access_token']
                        return resolve(result)
                    } catch (err) {
                        reject(err)
                    }
                }
            })
        })
    },
    makeImagesRequest(options) {
        if (!options || !options.phrase) throw new Error('Invalid params passed to GettyImagesService.js/makeImagesRequest')

        const cacheKey = options.phrase + '-' + options.page || '1'
        const _self = this;
        return GlobalCache.cache({
            GlobalCache: 'getty_images_cache'
        }).getData(cacheKey).then(function(getty_images_cached_data) {
            if (getty_images_cached_data) {
                return Promise.resolve(getty_images_cached_data)
            } else {
                return _self.getToken().then(function(result) {
                    const tokenType = result['token_type']
                    const authToken = result['access_token']

                    const reqObject = {
                        phrase: options.phrase,
                        page: options.page || 1,
                        page_size: options.pageSize || 100,
                        exclude_nudity: true,
                        embed_content_only: options['embed_content_only'] || true,
                        fields: 'display_set' || options.fields
                    }

                    const sendData = querystring.stringify(reqObject)

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
                                return reject(err || new Error('Body response was empty'))
                            } else {
                                try {
                                    const obj = JSON.parse(body)

                                    if (!obj) {
                                        console.log(obj)
                                        return reject(new Error('Error with request to ' + gettyAuthEndpoint + ' could not parse body'))
                                    } else if (obj.ErrorCode) {
                                        return reject(new Error('Error with request to ' + gettyAuthEndpoint + JSON.stringify(obj)))
                                    } else {
                                        GlobalCache.cache({
                                            GlobalCache: 'getty_images_cache'
                                        }).insertData(cacheKey, obj)
                                        return resolve(obj)
                                    }
                                } catch (err) {
                                    return reject(err)
                                }
                            }
                        })
                    })
                })
            }
        })
    },
    searchImages(phrase, pageNumber, numberOfImages) {
        return this.makeImagesRequest({
            phrase,
            page: pageNumber || 1,
            pageSize: numberOfImages || 100
        })
    },
    searchAndRetrieveUrls(options) {
        const _self = this;
        options.fields = 'display_set';
        return new Promise((resolve, reject) => {
            _self.makeImagesRequest(options).then(function(res) {
                sails.log.debug(JSON.stringify(res));
                if (res && res.images) {

                    //Map the images
                    resolve(res.images.map(function(image) {

                        for (var i = 0; i < image.display_sizes.length; i++) {
                            sails.log.debug('Display sizes: ' + JSON.stringify(image.display_sizes))
                            if (image.display_sizes[i].name != 'comp') {
                                continue;
                            }
                            sails.log.debug('Returning : ' + JSON.stringify(image.display_sizes[i]))
                            return image.display_sizes[i];
                        }

                        return null;

                        //Reject any images that didn't have `comp`
                    }).filter(function(image) {
                        return image != null;
                    }).map(function(image) {

                        return {
                            displaySizeImage: image.uri
                        }
                    }))
                } else {
                    reject(new Error('Could not obtain response'))
                }
            }).catch(function(err) {
                sails.log.error(err)
                Promise.reject(err)
            })
        })
    }
}