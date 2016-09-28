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