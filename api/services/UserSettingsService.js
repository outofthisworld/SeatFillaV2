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
  setUserSettings(req, keyValueMap, onlyUseSession) {
    if (!req || !keyValueMap)
      throw new Error('Invalid params passed to UserSettingsService.js/setUserSetting')

    function store (storageObject) {
      for (var key in keyValueMap) {
        if (Object.hasOwnProperty(key)) {
          storageObject[key] = keyValueMap[key]
        }
      }
    }

    if (req.user && !onlyUseSession) {
      return UserSettings.findOrCreate({
        user: req.user.id
      }, { user: req.user.id }).then(function (userSettings) {
        store(userSettings)

        userSettings.save(function (error) {
          if (error) {
            sails.log.debug('Error when saving user settings ' + JSON.stringify(error))
            sails.log.error(error)

            // We'll default to storing in session
            store(req.session)
            return Promise.resolve({ type: 'session' })
          } else {
            sails.log.debug('Successfully saved user setting for user ' + req.user.name +
              '(ID: ' + req.user.id + ')' + 'key = ' + settingKey + ' value = ' + settingValue)
            return Promise.resolve({ type: 'database' })
          }
        })
      }).catch(function (err) {
        sails.log.error(err)
        store(req.session)
        return Promise.resolve({ type: 'session' })
      })
    } else {
      sails.log.debug('Storing in session and returning promise');
      store(req.session)
      return Promise.resolve({ type: 'session' })
    }
  },
  getUserSettings(req, keyArr) {
    if (!req || !keyArr || !Array.isArray(keyArr))
      throw new Error('Invalid params passed to UserSettingsService.js/getUserSetting')

    const obj = {}
    for (key in keyArr) {
      if (req.user) {
        obj[key] = req.user.userSettings[key] || req.session[key]
      } else {
        obj[key] = req.session[key]
      }
    }
    return obj
  },
  getUserCurrentLocation(req){
    return this.getUserSettings(req, ['currentLocation']);
  },
  getUserCurrencyCodePreference(req){
    return this.getUserSettings(req,['currencyCodePreference']);
  },
  getUserLocalePreference(req){
    return this.getUserSettings(req,['localePreference']);
  },
  setUserCurrencyCodePreference(req, currencyCode) {
    return this.setUserSettings(req, { 'currencyCodePreference': currencyCode || 'USD' }, false)
  },
  setUserLocalePreference(req, localePreference) {
    return this.setUserSettings(req, { 'localePreference': localePreference || 'en-US' }, false)
  },
  setUserCurrentLocation(req, location) {
    const _self = this
    if (req.user) {
      UserLocationService.createNewUserLocation(req.user, location).then(function (userLocation) {
        const id = userLocation.id
        _self.setUserSettings(req, { 'currentLocation': id }, false)
      }).catch(function (err) {
        sails.log.error(err)
        return _self.setUserSettings(req, { 'currentLocation': location }, true)
      })
    } else {
      return _self.setUserSettings(req, { 'currentLocation': location }, true)
    }
  }
}
