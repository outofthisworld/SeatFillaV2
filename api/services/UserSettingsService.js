/* 
    Service for controlling and setting users preffered settings using the site 
*/

module.exports = {
    setUserCurrencyCodePreference(req, currencyCode) {
        if (req.user) {
            return UserSettings.findOrCreate({
                user: req.user.id
            }, { user: req.user.id }).then(function(userSettings) {
                userSettings.currencyCodePreference = currencyCode;

                userSettings.save(function(error) {
                    if (error) {
                        sails.log.debug('Error when saving user settings ' + JSON.stringify(error));
                    }
                });
            });
        } else {
            req.session.currencyCodePreference = currencyCode;
            return Promise.resolve({})
        }
    },
    getUserCurrencyCodePreference(req) {
        if (req.user) {
            return req.user.userSettings.currencyCodePreference || 'USD';
        } else {
            return req.session.currencyCodePreference || 'USD';
        }
    }
}