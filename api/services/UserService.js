const uuid = require('node-uuid')

module.exports = {
    createUser: function(req) {
        const _self = this

        const user = Object.assign({}, req.allParams());
        user.displayName = user.username;

        //Create user
        return User.create(req.allParams()).then(function create(user) {
            sails.log.debug('Creating user')

            // Well ofc..
            if (!user) {
                sails.log.debug('Error creating user')

                // Debug something
                return Promise.reject(err)
            }
            // Get rid of confedential information..
            delete user.password
            delete user.passwordConfirmation

            return Promise.resolve(user)
        }).then(function(user) {
            sails.log.debug('Creating address for user: ' + JSON.stringify(user))

            //Create address
            return _self.findOrCreateUserAddress(user.id, user).then(function(val) {
                return Promise.resolve({
                    user,
                    address: val.address,
                    countryInfo: val.countryInfo
                })
            }).catch(function(err) {
                err = err || new Error('Unknown error')
                err.modelErrors = err.modelErrors || []
                err.modelErrors.push({
                    model: 'User',
                    id: user.id
                })
                return Promise.reject(err)
            })

        }).then(function(user_partial) {
            sails.log.debug('User partial is: ' + JSON.stringify(user_partial))

            // Create user settings (preferences)
            return UserSettings.create({
                id: user_partial.user.id,
                localePreference: req.headers['Accept-Language'] || 'en-US'
            }).then(function(userSettings) {
                user_partial.userSettings = userSettings
                return Promise.resolve(user_partial)
            }).catch(function(err) {
                err.modelErrors = err.modelErrors || []
                err.modelErrors.push({
                    model: 'User',
                    id: user_partial.user.id
                })
                err.modelErrors.push({
                    model: 'Address',
                    id: user_partial.address.id
                })
                return Promise.reject(err)
            })

        }).then(function(user_partial) {

            //Create user profile
            return UserProfile.create({
                user: user_partial.user.id,
                description: 'Welcome to Seatfilla'
            }).then(function(userProfile) {
                user_partial.userProfile = userProfile
                return Promise.resolve(user_partial)
            }).catch(function(err) {
                err.modelErrors = err.modelErrors || []
                err.modelErrors.push({
                    model: 'User',
                    id: user_partial.user.id
                })
                err.modelErrors.push({
                    model: 'Address',
                    id: user_partial.address.id
                })
                err.modelErrors.push({
                    model: ' UserSettings',
                    id: user_partial.userSettings.id
                })
                return Promise.reject(err)
            })

        }).then(function(user_partial) {
            sails.log.debug('Creating sign up record for user: ' + JSON.stringify(user_partial))

            // Register the sign up..
            return Signup.create({
                ip: req.ip,
                user_agent: req.headers['user-agent'],
                user: user_partial.user.id
            }).then(function(signup) {
                user_partial.user.verificationId = signup.id
                return Promise.resolve(user_partial)
            }).catch(function(err) {
                sails.log.debug('Error creating sign up record for user id :' + user_partial.user.id + 'Error: ' + err)
                err.modelErrors = err.modelErrors || []
                err.modelErrors.push({
                    model: 'User',
                    id: user_partial.user.id
                })
                err.modelErrors.push({
                    model: 'Address',
                    id: user_partial.user.address.id
                })
                err.modelErrors.push({
                    model: 'UserSettings',
                    id: user_partial.user.userSettings.id
                })
                err.modelErrors.push({
                    model: 'UserProfile',
                    id: user_partial.userProfile.id
                })
                return Promise.reject(err)
            })
        }).then(function(user_partial) {

            const message = sails.config.email.messageTemplates.registration(user_partial.user)
            sails.log.debug('Created email template ' + JSON.stringify(message))

            // Send an email async
            return EmailService.sendEmailAsync(message).then(function getInfo(info) {
                sails.log.debug('Succesfully sent email... ' + info)
                return Promise.resolve(user_partial)
            }).catch(function(err) {
                sails.log.error(err)
                    // Error sending email.. handle it
                sails.log.debug('Failed to send email... ' + message + 'error: ' + err)
                err.modelErrors = err.modelErrors || []
                err.modelErrors.push({
                    model: 'User',
                    id: user_partial.user.id
                })
                err.modelErrors.push({
                    model: 'Address',
                    id: user_partial.address.id
                })
                err.modelErrors.push({
                    model: 'UserSettings',
                    id: user_partial.userSettings.id
                })
                err.modelErrors.push({
                    model: 'Signup',
                    id: signup.id
                })
                err.modelErrors.push({
                    model: 'UserProfile',
                    id: user_partial.userProfile.id
                })
                sails.log.debug('Error sending email in UserService.js/createUser')
                return reject(err)
            })
        }).then(function(user_partial) {
            // Lets broadcast a message..
            NotificationService.sendDedicatedNotificationAsync(req)({
                title: 'You have succesfully registered!',
                message: "Thank-you for registering at SeatFilla, don't forget to validate your email!"
            })

            return Promise.resolve(user_partial);
        }).catch(function(err) {

            //Catch and fix and model errors during this proccess 
            if (err.modelErrors) {
                sails.log.debug('Correcting any model errors')
                try {
                    err.modelErrors.forEach(function(modelError) {
                        if (!modelError.model || !modelError.id) {
                            return Promise.reject(new Error('Invalid model error, no model or id attribute'))
                        }

                        if (modelError.model in sails.models && '_attributes' in sails.model[modelError.model]) {
                            for (var key in sails.models[modelError.model]._attributes) {
                                if ('primaryKey' in sails.models[modelError.model]._attributes[key] &&
                                    sails.models[modelError.model]._attributes[key]['primaryKey']) {
                                    if (!sails.models[modelErros.model]._attributes[key]['type'])
                                        return Promise.reject(new Error('Could not determine type of model attribute ' + key))

                                    const modelPrimaryKey = key

                                    sails.model[modelError.model].destroy({
                                        modelPrimaryKey: modelError.id
                                    }).then(function() {
                                        sails.log.debug('Destoryed record for model ' + modelError.model + ' with id ' + modelError.id)
                                    }).catch(function(err) {
                                        sails.log.error(err)
                                    })
                                }
                            }
                        } else {
                            return Promise.reject(new Error('Invalid model specified for model errors'))
                        }
                    })
                } catch (error) {
                    sails.log.error(error)
                    return Promise.reject(err)
                }
                sails.log.error(err)
                return Promise.reject(err)
            } else {
                sails.log.error(err)
                return Promise.reject(err)
            }
        })
    },
    findOrCreateUserAddress(userId, addressInfo) {
        sails.log.debug('AddressInfo in UserService.js/findOrCreateAddress is:')
        sails.log.debug(JSON.stringify(addressInfo))
        sails.log.debug('Calling UserLocationService.js/findOrCreateCountry with data ' + addressInfo.country)
            // Attempt to look up country info

        return UserLocationService.findOrCreateCountry(addressInfo.country).then(function(country) {
            sails.log.debug('Country info after calling UserLocationService.js/findOrCreateCountry ')
            sails.log.debug(JSON.stringify(country))

            addressInfo.countryInfo = country.alpha3Code
            addressInfo.user = userId.id || userId

            sails.log.debug('Final address info: ')
            sails.log.debug(JSON.stringify(addressInfo))

            // Create an address and use the alpha 3 country code 
            // to link to the country table. Note that
            // country name is being duplicated as its required the most.
            return new Promise(function(resolve, reject) {
                Address.findOrCreate(addressInfo, addressInfo, function(err, address) {
                    if (err) {
                        sails.log.error(err)
                        return reject(err)
                    } else {
                        // We couldn't create the address record.. log the error
                        sails.log.debug('Found or created address : ' + JSON.stringify(address))
                            // Return a promise with the collected user info so far.
                        return resolve({
                            address,
                            countryInfo: country
                        })
                    }
                })
            })
        }).catch(function(err) {
            sails.log.error(err);
            return Promise.reject(err);
        })
    },
    // Creates an external passport user.
    createExternalUser: function(req, accessToken, refreshToken, profile) {
        sails.log.debug('Creating external user')

        return new Promise(function(resolve, reject) {
            const providerKey = profile.provider + 'Id'
            const find = {
                provider: profile.provider
            }
            find[providerKey] = profile.id

            // Cheap hacks >.< (they all provide different data.. makes model validation hard too)
            const externalInfo = {
                twitter: {
                    username: (function() {
                        return profile.username
                    })(),
                    provider: (function() {
                        return profile.provider
                    })(),
                    firstName: (function() {
                        return profile._json.name
                    })(),
                    profile_image_url: (function() {
                        return profile._json.profile_image_url || null
                    })(),
                    emailIsVerified: (function() {
                        return false
                    })(),
                    isLockedOut: false
                },
                facebook: {
                    provider: (function() {
                        return profile.provider
                    })(),
                    firstName: (function() {
                        return profile.name.givenName
                    }()),
                    middleName: (function() {
                        return profile.name.middleName
                    })(),
                    lastName: (function() {
                        return profile.name.familyName
                    })(),
                    email: (function() {
                        if (Array.isArray(profile.emails) && profile.emails.length > 0) {
                            return profile.emails[0].value
                        } else {
                            return null
                        }
                    })(),
                    username: (function() {
                        if (!this.email) {
                            return firstName + lastName + Math.ceil((Math.random() + 0.01) *
                                ((Math.random() * 2000) + (Math.random() * 99999)))
                        } else {
                            return null
                        }
                    })(),
                    profile_image_url: (function() {
                        if (Array.isArray(profile.photos) && profile.photos.length > 0) {
                            return profile.photos[0].value
                        } else {
                            return null
                        }
                    })(),
                    emailIsVerified: (function() {
                        return this.email || false
                    })(),
                    isLockedOut: false
                },
                google: {

                }
            }

            const create = externalInfo[profile.provider]
            if (!create) return reject(new Error('Unsupported provider !!' + profile.provider))

            create[providerKey] = profile.id

            User.findOrCreate(find, create,
                function(err, user) {
                    if (err) {
                        return reject(err || new Error('Could not create user'))
                    }

                    if (create.profile_image_url) {
                        UserImage.create({
                            user: user.id,
                            url: create.profile_image_url
                        }).exec(function(err, userImage) {})
                    }
                    res.session.provider = profile.provider
                    req.session[req.session.provider] = {}
                    req.session[req.session.provider].accessToken = accessToken
                    req.session[req.session.provider].refreshToken = refreshToken

                    if (user.emailIsVerified) {
                        NotificationService.sendDedicatedNotificationAsync(req)({
                            title: 'Thank-you for registering with SeatFilla via ' + profile.provider,
                            message: 'Your email has been automatically verified, no further action is required!'
                        })
                    } else {
                        NotificationService.sendDedicatedNotificationAsync(req)({
                            title: 'Thank-you for registering with SeatFilla via ' + profile.provider,
                            message: 'Please provide your email so we can validate your account!'
                        })
                    }

                    return resolve(user)
                })
        })
    },
    deleteUser: function(obj) {
        return new Promise(function(resolve, reject) {
            const destroy = function(id) {
                User.destroy(id).exec(function(err, res) {
                    if (err) return reject(err)
                    else return resolve(res)
                })
            }
            if (obj && obj.user && obj.user.id) {
                destroy(obj.user.id)
            } else if (obj && obj.id) {
                destroy(obj.id)
            } else if (Number.isInteger(obj)) {
                destroy(obj)
            } else {
                reject(new Error('Could not find id associated with user'))
            }
        })
    },
    verifyPasswordAsync: function(obj, passToVerify) {
        return new Promise(function(resolve, reject) {
            if (obj.user) return obj.user.verifyPassword(passToVerify)
            else if (obj.changePassword) return obj.verifyPassword(passToVerify)
        })
    },
    changePasswordAsync: function(obj, pass) {
        return new Promise(function(resolve, reject) {
            const cb = function(err, u) {
                if (err) return reject(err)
                else return resolve(u)
            }
            if (obj.user) {
                obj.user.changePassword(pass, cb)
            } else if (obj.changePassword) {
                obj.changePassword(pass, cb)
            }
        })
    },
    logout(req) {
        if (!req.user) return

        req.logout()
        req.session.destroy()
    },
    saveUserImage(user, fileName, imageData, onFinish) {
        const path = '../images/users/' + user.email + '/profile-images/' + uuid.uuid() + fileName
        FileService.writeBinaryFile(path, imageData, onFinish)
    }
}