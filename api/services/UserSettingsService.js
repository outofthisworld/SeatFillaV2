/* 
    Service for controlling and setting users preffered settings using the site.

    Created by Dale
*/

module.exports = {

    /*
        Sets a user setting  using the supplied key and value.

        Attempts to find or create a user settings record if the user is logged in, 
        otherwise defaults to storing the specified user setting within session storage.

        Returns a promise of the following nature:

        { key: settingKey, value: settingValue, type: 'database' }

        Where type denotes where the key and value were stored after calling this method.
        This is for convenience and can also be deduced by checking if req.user exists.

        This method should make it easy to add other user settings methods to this file in the future.
    */
    setUserSetting(req, settingKey, settingValue, onlyUseSession = false) {

        function storeInSession() {
            req.session[settingKey] = settingValue;
            return Promise.resolve({ key: settingKey, value: settingValue, type: 'session' });
        }

        if (onlyUseSession) {
            return storeInSession();
        }

        if (req.user) {
            return UserSettings.findOrCreate({
                user: req.user.id
            }, { user: req.user.id }).then(function(userSettings) {
                userSettings[settingKey] = settingValue;

                userSettings.save(function(error) {
                    if (error) {
                        sails.log.debug('Error when saving user settings ' + JSON.stringify(error));
                        sails.log.error(error);

                        //We'll default to storing in session
                        return storeInSession();
                    } else {
                        sails.log.debug('Successfully saved user setting for user ' + req.user.name +
                            '(ID: ' + req.user.id + ')' + 'key = ' + settingKey + ' value = ' + settingValue);
                        return Promise.resolve({ key: settingKey, value: settingValue, type: 'database' });
                    }
                });
            });
        } else {
            return storeInSession();
        }
    },
    getUserSetting(req, settingKey) {
        if (req.user) {
            return req.user.userSettings[settingKey] || req.session[settingKey];
        } else {
            return req.session[settingKey];
        }
    },
    setUserCurrencyCodePreference(req, currencyCode) {
        return this.setUserSetting(req, 'currencyCodePreference', currencyCode || 'USD');
    },
    getUserCurrencyCodePreference(req) {
        return this.getUserSetting(req, 'currencyCodePreference') || 'USD';
    },
    setUserLocalePreference(req, localePreference) {
        return this.setUserSetting(req, 'localePreference', localePreference || 'en-US');
    },
    getUserLocalePreference(req) {
        return this.getUserSetting(req, 'localePreference') || 'USD';
    },
    setUserCurrentLocation(req, location) {
        const _self = this;
        if (req.user) {
            UserLocationService.createNewUserLocation(req.user, location).then(function(userLocation) {
                const id = userLocation.id;
                _self.setUserSetting(req, 'currentLocation', id, false);
            }).catch(function(err) {
                sails.log.error(err);
                return _self.setUserSetting(req, 'currentLocation', location, true);
            })
        } else {
            return this.setUserSetting(req, 'currentLocation', location, true);
        }
    },
    getUserCurrentLocation(req) {
        return this.getUserSetting(req, 'currentLocation');
    }
}