/*
    This module will handle webhook related tasks,

**/

// Request module for sending and recieving API requests
const request = require('request')

const webHookMapping = {
        'FlightRequestCreate': ['/apiV1/FlightRequest/create'],
        'FlightRequestUpdate': ['/apiV1/FlightRequest/update'],
        'FlightRequestDestroy': ['/apiV1/FlightRequest/destroy'],
        'FlightOfferCreate': ['/apiV1/FlightOffer/create'],
        'FlightOfferUpdate': ['/apiV1/FlightOffer/update'],
        'FlightOfferDestroy': ['/apiV1/FlightOffer/destroy']
    }
    // Request comes in to create a new flight offer
    // Flight offer can be created at apiv1/flightOffer/create or flightoffer/create
    //
    // Now we need to notify all web hooks listening for FlightOfferCreations
module.exports = {
    getWebhookMapping() {
        return Object.create(webHookMapping)
    },
    triggerWebhook(options, data) {
        return new Promise(function(resolve, reject) {
            if (!options) return reject(new Error('Invalid params to trigger webhook'))

            var paths = null
            var eventType = options.eventType
            if (options.eventType) {
                paths = webHookMapping[options.eventType]
            } else if (options.path) {
                paths = []
                for (var key in webHookMapping) {
                    paths.push(webHookMapping[key].filter(function(path) {
                        if (path == options.path) {
                            eventType = key
                            return true
                        } else {
                            return false
                        }
                    }))
                    if (paths.length == 1) break
                }
                paths = [].concat.apply([], paths)
            }

            if (!paths || paths.length == 0)
                return reject(new Error('Invalid webhook event type'))

            async.auto({
                findRoutesForEventType(callback) {
                    ApiRoutes.find({
                        route: paths
                    }).then(function(routes) {
                        return callback(null, routes)
                    }).catch(function(err) {
                        return callback(err, null)
                    })
                },
                findWebhookForRoutes: ['findRoutesForEventType', function(callback, results) {
                    Webhook.find({
                            routes: results.findRoutesForEventType.map(function(route) {
                                return route.id
                            }),
                            isVerified: true
                        })
                        .then(function(webhooks) {
                            return callback(webhooks, null)
                        }).catch(function(err) {
                            return callback(err, null)
                        })
                }],
                sendWebhookRequests: ['findWebhookForRoutes', function(callback, results) {
                    results.findWebhookForRoutes.forEach(function(webhook) {
                        if (!webhook.isVerified) return;

                        const webHookUrl = webhook.url
                        const webHookParam = webhook.sfVerificationParam
                        const promises = []

                        promises.push(new Promise(function(resolve, reject) {
                            request({
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'x-seatfilla-web-hook-key': webHookParam
                                },
                                uri: updatedWebhook.url,
                                data,
                                method: 'POST'
                            }, function(err, res, body) {
                                if (err) {
                                    const error = new Error('Recieved error when sending request to ' + webHookUrl + ': ' + err.message);
                                    return resolve({
                                        error,
                                        webhook
                                    });
                                } else if (res.status != 200) {
                                    const error = new Error('Status was not 200 after sending the request to ' + webHookUrl);
                                    return resolve({
                                        error,
                                        webhook
                                    })
                                } else {
                                    return resolve(webhook);
                                }
                            })
                        }));

                        Promise.all(promises).then(function(results) {
                            const resultsObject = {
                                errors: [],
                                success: []
                            }
                            results.forEach(function(result) {
                                if (result.error) {
                                    sails.log.error(result.error);
                                    errors.push(result.errors);
                                } else {
                                    sails.push(result.webhook);
                                }
                            })

                            return callback(null, resultsObject);
                        }).catch(function(err) {
                            sails.log.error(err);
                            return callback(err, null);
                        })
                    })
                }]
            }, function(err, results) {
                if (err) {
                    return reject(err);
                } else {
                    if (options.handleErrors) {
                        //Schedule resend, handle errors ..
                        results.sendWebhookRequests.errors.forEach(function(err) {
                            //Handle
                        })
                    }
                    return resolve(results.sendWebhookRequests);
                }
            })
        })
    },
    verifyWebhook(options) {
        return new Promise(function(resolve, reject) {

            function tryVerify(webHook) {
                return new Promise(function(resolve, reject) {
                    if (webhook.verificationToken && webhook.verificationToken == options.token) {
                        webHook.isVerified = true
                        webHook.save(function(err) {
                            if (err) {
                                sails.log.error(err)
                                return reject(new Error('Error saving verified web hook though response was valid'))
                            } else {
                                return resolve(updatedWebhook)
                            }
                        })
                    } else {
                        return reject(new Error('Error when validating verification token'))
                    }
                })
            }
            if (options.token && options.webHook && options.token == options.webHook.verificationToken) {
                return resolve(tryVerify(options.webHook))
            } else if (options.webHookId && options.token) {
                return Webhook.find({
                        id: options.webHookId
                    })
                    .then(function(webhook) {
                        return resolve(tryVerify(webhook))
                    }).catch(function(err) {
                        sails.log.error(err)
                        return reject(err)
                    })
            } else {
                return reject(new Error('Invalid params supplied to verify webHook ' + JSON.stringify(options)))
            }
        })
    },
    sendWebhookVerification(webHook, url) {
        const token = require('node-uuid').v4()
        const _this = this
        const id = typeof webHook == 'number' ? webHook : webHook.id;
        if (!typeof id == 'number') return Promise.reject(new Error('Invalid aprams'));

        return Webhook.update({
            id: webHook.id
        }, {
            verificationToken: token
        }).then(function(updatedWebhook) {
            return new Promise(function(resolve, reject) {
                if (!updatedWebhook) {
                    return reject(new Error('Supplied webhook id does not exist'));
                }
                if (!updatedWebhook.url.includes(url)) {
                    return reject(new Error('Invalid verification URL, domains do not match'))
                }
                request({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    uri: updatedWebhook.url,
                    data: {
                        verificationToken: updatedWebhook.verificationToken
                    },
                    method: 'POST'
                }, function(err, res, body) {
                    if (err) {
                        return reject(err)
                    } else if (res.status != 200) {
                        return reject(new Error('Response status from provided URL was not 200'))
                    } else if (res.body && res.body.verificationToken) {
                        return _this.verifyWebhook({
                            webHook: updatedWebhook,
                            token
                        })
                    }
                    return resolve(updatedWebhook)
                })
            })
        }).catch(function(err) {
            sails.log.error(err)
            return Promise.reject(err)
        })
    },
    /*
      Creates a new web hook,

      Params url: the web hook url
    */
    createWebHook(url, key, message, algorithm, apiUser, options) {
        return new Promise(function(resolve, reject) {
            if (!options || (!options.webHookTypes))
                return reject(new Error('Invalid params to create web hook'))

            if (!Array.isArray(options.webHookTypes))
                return reject(new Error('webHookTypes should be an array'))

            /*
               Verify the URL here
            */

            async.auto({
                createOrFindApiRoutes: function(callback) {
                    const paths = options.webHookTypes.map(function(type) {
                        const paths = webHookMapping[type]
                        if (!paths) return null;
                        return paths
                    }).filter(function(paths) {
                        return paths != null
                    })

                    // Merge and map the paths
                    const mappedPaths = [].concat.apply([], paths).map(function(path, indx) {
                        return {
                            route: path
                        }
                    })

                    sails.log.debug('Mapped paths:')
                    sails.log.debug(JSON.stringify(mappedPaths))

                    ApiRoutes.findOrCreate(mappedPaths, mappedPaths)
                        .then(function(apiRoutes) {
                            return callback(null, apiRoutes)
                        }).catch(function(err) {
                            sails.log.error(err)
                            return callback(err, null)
                        })
                }
            }, function(err, results) {
                if (err) {
                    return reject(err)
                }
                // Encrypt the message with the key, don't store the key
                // When a webhook request is sent from seatfilla
                // to someone, the request param can be decrypted 
                // with the same algorithm supplied and checking to see that the message
                // is the message they supplied when they created the webhook.
                var cipher = require('crypto').createCipher(algorithm, key)
                var encrypted = cipher.update(message, 'utf8', 'hex') + cipher.final('hex')
                    // webhook can have many routes
                    // routes can have many webhooks    
                return Webhook.create({
                    routes: results.createOrFindApiRoutes.map(function(apiRoute) {
                        return apiRoute.route
                    }),
                    url,
                    sfVerificationParam: encrypted,
                    apiUser
                }).then(function(webhook) {
                    return resolve(webhook)
                }).catch(function(err) {
                    sails.log.error(err)
                    return reject(err)
                })
            })
        })
    }
}