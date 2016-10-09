/*
    Created by Dale.

    Controller for setting users preffered settings when using seatfilla.
*/

module.exports = {
    /* 
        Sets the preffered currency when using the website .
        If the user is logged in, this preference is saved to their settings.
        Otherwise, its saved in session storage. Another way to handle this would be client side
        javascript, however it may become a bit tedious sending the currency in each request.
    */
    setStoredSetting(req, res) {
        const obj = req.allParams();
        for (key in obj) {
            if (Object.hasOwnProperty(key)) {
                try {
                    UserSettingsService.setUserSetting(req, key, req.param(key)).then(function() {
                        return res.json(ResponseStatus.OK, { status: 200 });
                    }).catch(function(err) {
                        return res.json(ResponseStatus.OK, { status: 1738 });
                    });
                } catch (err) {
                    return res.json(ResponseStatus.OK, { status: 1738 });
                }
            }
        }
    },
    getStoredSetting(req, res) {

    },
    setCurrencyCodePreference(req, res) {
        UserSettingsService.setUserCurrencyCodePreference(req, req.param('currencyCodePreference')).then(function() {
            return res.json(ResponseStatus.OK, {});
        }).catch(function(err) {
            return res.json(ResponseStatus.SERVER_ERROR, { error: err });
        });
    },
    getCurrencyCodePreference(req, res) {
        return res.json(ResponseStatus.OK, { currencyCodePreference: UserSettingsService.getUserCurrencyCodePreference(req) });
    },
    setPrefferedTimezone(req, res) {

    }
}