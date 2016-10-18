/*
    Created by Dale.

    Controller for setting users preffered settings when using seatfilla.
*/

module.exports = {
  /* 
      Sets the specified settings
  */
  setStoredSettings(req, res) {
    obj = req.param('data')
    if (!obj) {
      return res.json(
        ResponseStatus.OK,
        { status: 1738,
          errors: ['Invalid request'],
          errorMessage: "param 'Data' not set."
        })
    }

    const errors = []
    const types = []

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (!obj[key].key || !obj[key].data) {
          return res.json(ResponseStatus.OK, {
            status: 1738,
            errors: ['Invalid request'],
            errorMessage: 'Must have key and data set for all settings passed'
          })
        }
        sails.log.debug('Setting user setting :' + obj[key].key)

        try {
          UserSettingsService['setUser' + obj[key].key](req, obj[key].data).then(function(data){types.push(data)}).catch(function (err) {
            sails.log.error(err)
            errors.push('Error setting ' + obj[key].key + ' err message = ' + err.message)
          })
        } catch (err) {
          sails.log.error(err)
          errors.push('Error setting ' + obj[key].key + ' err message = ' + err.message)
        }
      }
    }

    if (errors.length > 0) {
      return res.json(ResponseStatus.OK, { status: 1738, errors })
    } else {
      return res.json(ResponseStatus.OK, { status: 200, types })
    }
  },
  /*
     Gets the specified settings
  */
  getStoredSettings(req, res) {
    return res.json(ResponseStatus.OK, UserSettingsService.getUserSettings(req, Object.keys(req.allParams())))
  }
}
