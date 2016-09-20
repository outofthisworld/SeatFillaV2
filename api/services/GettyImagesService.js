//Request module for sending and recieving API requests
const request = require('request');
//Used to encode form data
const querystring = require('querystring');
//Error utils for more details errors
const ErrorUtils = require('./../utils').ErrorUtils;

const sandBoxApiKey = 'f98wrt5y3p4234r5vecuuf8c';
const sandBoxSecret = 'rf6Wua5AKXMzgEWHbynZQa5WrqrDwe9sQeDD8A42aP8S5';

const embededApiKey = 'uqdsewc7gn79apjzdmd7qkya';
const embededSecret = '3QUvputDkf5UqzWNsA8EhwNfGVGA2GDRW6N6kXEFXXjkt';

const gettyAuthEndpoint = 'api.gettyimages.com/oauth2/token/';

var token = null;
var tokenRequestTime = null;
var tokenExpiraryTime = 1800; //In seconds


module.exports = {
    getToken() {
        return new Promise((resolve, reject) => {
            if (token && tokenRequestTime && ((new Date().getTime() - tokenRequestTime) / 1000) <
                (tokenExpiraryTime - 60)) return resolve(token);

            tokenRequestTime = new Date().getTime();
            //Make the request

            /*
                POST /token HTTPS/1.1
                Host: api.gettyimages.com/oauth2/token/
                Content-Type: application/x-www-form-urlencoded

                client_id=TestClientId&client_secret=TestSecret&grant_type=client_credentials
            */

            const requestObject = {
                grant_type = 'client_credentials',
                client_id: sandBoxApiKey,
                client_secret = sandBoxSecret
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
    searchImages(options) {
        return this.getToken().then(function(result) {

            const tokenType = result.body['token_type'];
            const authToken = result.body['access_token'];

            const reqObject = {
                page: options.page,
                page_size: ''
            }

            request({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Api-Key': sandBoxApiKey,
                    'Accept-Language': 'en-US',
                    'Authorization': tokenType + ' ' + authToken
                },
                uri: 'https://api.gettyimages.com/v3/search/images',
                body: sendData,
                method: 'GET'
            }, function(err, res, body) {
                if (err) {
                    return Promise.reject(err);
                } else {
                    return res.body;
                }
            });
        });
    }
}