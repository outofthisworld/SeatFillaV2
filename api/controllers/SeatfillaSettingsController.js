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
    setCurrencyCodePreference(req, res) {
        if (req.user) {
            UserSettings.findOrCreate({
                user: req.user.id
            }, { user: req.user.id }).then(function(userSettings) {
                userSettings.currencyCodePreference = req.param('currencyCodePreference');

                userSettings.save(function(error) {
                    if (error) {
                        sails.log.debug('Error when saving user settings ' + JSON.stringify(error));
                    }
                });
                return res.json(ResponseStatus.OK, {});
            }).catch(function(err) {
                sails.log.debug('Error when creating user settings ' + JSON.stringify(err));
                res.json(ResponseStatus.SERVER_ERROR, { error: err });
            })
        } else {
            req.session.currencyCodePreference = req.param('currencyCodePreference');
            return res.json(ResponseStatus.OK, {});
        }
    },
    getCurrencyCodePreference(req, res) {
        if (req.user) {
            return res.json(ReponseStatus.OK, { currencyCodePreference: req.user.userSettings.currencyCodePreference });
        } else {
            return res.json(Response.OK, req.session.currencyCodePreference);
        }
    },
    setPrefferedTimezone(req, res) {

    }
}