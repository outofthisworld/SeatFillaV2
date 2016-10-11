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
                status: 1738,
                error: new Error('Unable to retrieve sky scanner currency codes'),
                errorMessage: 'Error retrieving currency codes'
            });
        });
    },
    getCountryInformation(req, res) {
        if (!req.param(countryCode)) return res.badRequest('countryCode must be suppplied.');

        LookupService.rest_countries_get_country_info(req.param('countryCode')).then(function(result) {
            result.status = 200;
            return res.json(ResponseStatus.OK, result);
        }).catch(function(err) {
            sails.log.error(err);

            return res.json(ResponseStatus.SERVER_ERROR, {
                status: 1738,
                error: new Error('Unable to retrieve country information from rest countries'),
                errorMessage: 'Error retrieving country information'
            });
        });
    },
    getCurrentCurrencyExchangeRates(req, res) {
        if (!req.param('base')) return res.badRequest('base currency must be supplied.');

        LookupService.fixer_io_get_exchange_rates(req.param('base')).then(function(result) {
            result.status = 200;
            return res.json(ResponseStatus.OK, result);
        }).catch(function(err) {
            sails.log.error(err);

            return res.json(ResponseStatus.SERVER_ERROR, {
                status: 1738,
                error: new Error('Unable to retrieve currency exchange rates'),
                errorMessage: 'Error retrieving currency information'
            });
        });
    }
}