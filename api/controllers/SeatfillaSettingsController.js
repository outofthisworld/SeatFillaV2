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
                ResponseStatus.OK, {
                    status: 1738,
                    errors: ['Invalid request'],
                    errorMessage: "param 'Data' not set."
                })
        }

        sails.log.debug('Setting user settings :' + JSON.stringify(obj));

        const errors = []
        const types = []

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (!obj[key].key || !obj[key].data) {
                    errors.push('Invalid object consturct for object ' + JSON.stringify(obj));
                    continue;
                }
                sails.log.debug('Setting user setting :' + obj[key].key)

                try {
                    UserSettingsService['setUser' + obj[key].key](req, obj[key].data).then(function(data) {
                            types.push(data)
                        })
                        .catch(function(err) {
                            sails.log.error(err)
                            errors.push('Error setting ' + obj[key].key + ' err message = ' + err.message)
                        })
                } catch (err) {
                    sails.log.error(err)
                    errors.push('Error setting ' + obj[key].key + ' err message = ' + err.message)
                }
            }
        }

        sails.log.debug('Current session settings: ' + JSON.stringify(req.session));

        if (errors.length > 0) {
            return res.json(ResponseStatus.OK, {
                status: 1738,
                errors
            })
        } else {
            return res.json(ResponseStatus.OK, {
                status: 200,
                types
            })
        }
    },
    /*
       Gets the specified settings
    */
    getStoredSettings(req, res) {
        const settings = UserSettingsService.getUserSettings(req, Object.keys(req.allParams())).then(function(settings) {
            sails.log.debug('Retrieved user settings ' + JSON.stringify(settings));
            settings.status = 200;
            return res.json(ResponseStatus.OK, settings);
        })
    }
}