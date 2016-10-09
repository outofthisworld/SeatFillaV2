/*
    Created by Dale.

    Controller for setting users preffered settings when using seatfilla.
*/

module.exports = {
    /* 
        Sets the specified settings
    */
    setStoredSettings(req, res) {
        const obj = req.allParams();
        const errors = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                try {
                    UserSettingsService['setUser' + key](req, obj[key]).catch(function(err) {
                        errors.push('Error setting ' + key + ' err message = ' + err.message);
                    });
                } catch (err) {
                    errors.push('Error setting ' + key + ' err message = ' + err.message);
                }
            }
        }

        if (errors.length > 0) {
            return res.json(ResponseStatus.OK, { status: 1738, errors});
        } else {
            return res.json(ResponseStatus.OK, { status: 200 });
        }
    },
    /*
       Gets the specified settings
    */
    getStoredSettings(req, res) {
        UserSettingsService.getUserSettings(req, Object.keys(req.allParams()));
    }
}