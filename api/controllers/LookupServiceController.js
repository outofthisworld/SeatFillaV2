const errorUtils = require('../utils/ErrorUtils');

module.exports = {
    getSkyScannerCurrencyCodes(req, res) {
        SkyScannerLookupService.getCurrencyCodes().then(function(currencyCodes) {
            sails.log.debug('Recieved currency codes from lookup service ' + currencyCodes);
            currencyCodes.status = 200;
            return res.json(ResponseStatus.OK, currencyCodes);
        }).catch(function(err) {
            sails.log.error(err);
            return res.json(ResponseStatus.SERVER_ERROR, {
                error: new Error('Unable to retrieve sky scanner currency codes'),
                errorMessage: 'Error retrieving currency codes'
            });
        });
    },
    getCountryInformation(req, res) {
        LookupService.rest_countries_get_country_info(req.param('countryCode')).then(function(result) {
            result.status = 200;
            return res.json(ResponseStatus.OK, result);
        }).catch(function(err) {
            sails.log.error(err);

            return res.json(ResponseStatus.SERVER_ERROR, {
                error: new Error('Unable to retrieve country information from rest countries'),
                errorMessage: 'Error retrieving country information'
            });
        });
    }
}