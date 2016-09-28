const errorUtils = require('../utils/ErrorUtils');

module.exports = {
    getSkyScannerCurrencyCodes() {
        SkyScannerLookupService.getCurrencyCodes().then(function(currencyCodes) {
            return res.json({ status: 200, currencyCodes });
        }).catch(function(err) {
            errorUtils.createNewError('Unable to retrieve sky scanner currency codes', arguments, err);
        });
    }
}