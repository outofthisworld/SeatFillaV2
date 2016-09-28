const errorUtils = require('../utils/ErrorUtils');

module.exports = {
    getSkyScannerCurrencyCodes(req, res) {
        SkyScannerLookupService.getCurrencyCodes().then(function(currencyCodes) {
            sails.log.debug('Recieved currency codes from lookup service ' + currencyCodes);
            return res.json(ResponseStatus.OK, currencyCodes);
        }).catch(function(err) {
            return res.json(ResponseStatus.SERVER_ERROR, {
                error: errorUtils.createNewError('Unable to retrieve sky scanner currency codes', arguments, err),
                errorMessage: 'Error retrieving currency codes'
            });
        });
    }
}