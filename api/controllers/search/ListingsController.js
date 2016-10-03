module.exports = {
    home(req, res) {
        return res.ok({ user: req.user }, {
            view: '/search/listings/search',
            layout: 'layouts/search-layout',
        });
    },
    flights(req, res) {
        return res.ok({ user: req.user, type: 'Flights' }, {
            view: '/search/listings/search-flights',
            layout: 'layouts/search-layout'
        });
    },
    hotels(req, res) {
        const hotelRequestObject = SkyScannerHotelService.getDefaultHotelRequestObject();
        const sessionObject = SkyScannerHotelService.getDefaultSessionObject();

        try {
            req.body.userLocation = JSON.parse(req.param('userLocation'));
            req.body.dates = JSON.parse(req.param('dates'));
            req.body.ticketInfo = JSON.parse(req.param('ticketInfo'));
            req.body.destination = JSON.parse(req.param('destination'));
            req.body.origin = JSON.parse(req.param('origin'));
        } catch (err) {
            sails.log.debug('Error parsing JSON in ListingsController.js/hotels');
            sails.log.error(err);
        }

        if (req.param('chosenItinerary')) {
            req.body.chosenItinerary = JSON.parse(req.param('chosenItinerary'));

            if (!req.session.itineraries)
                req.session.itineraries = [];

            req.session.itineraries.push(req.body.chosenItinerary);
        }

        sessionObject.market = req.body.userLocation.address.countryCode || req.body.origin.airportCountryId || req.body.userLocation.address.country || (req.user && req.user.address.country);
        sessionObject.currency = req.body.prefferedCurrency || UserSettingsService.getUserCurrencyCodePreference(req);
        sessionObject.locale = req.headers['accept-language'];
        sessionObject.entityId = req.body.destination.airportPos.lat + ',' + req.body.destination.airportPos.lng + 'latlong';
        sessionObject.checkindate = (req.body.dates && req.body.dates.departure) || (new Date().toISOString().slice(0, 10));
        sessionObject.checkoutdate = (req.body.dates && req.body.dates.arrival) || null;
        sessionObject.guests = parseInt(((req.body.ticketInfo && req.body.ticketInfo.numAdultTickets)) || 1) +
            parseInt(((req.body.ticketInfo && req.body.ticketInfo.numChildTickets)) || 0) +
            parseInt(((req.body.ticketInfo && req.body.ticketInfo.numInfantTickets) || 0));
        sessionObject.rooms = req.body.numRooms || 1;

        sails.log.debug('Created hotels session object : ' + JSON.stringify(sessionObject));

        SkyScannerHotelService.initiateFirstSession(sessionObject, hotelRequestObject).then(function(result) {
            return res.ok({ user: req.user, hotelListings: result.body, nextPollUrl: result.url, type: 'Hotels' }, {
                view: '/search/listings/hotels/search-hotels',
                layout: 'layouts/search-layout',
            });
        }).catch(function(err) {
            sails.log.debug('Error in ListingsController.js/hotels');
            sails.log.error(err);
            sails.log.debug(err.message);
            return res.badRequest(err);
        });
    },
    cars(req, res) {

    }
}