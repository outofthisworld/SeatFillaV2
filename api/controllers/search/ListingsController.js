module.exports = {
    home(req, res) {
        return res.ok({ user: req.user }, {
            view: '/search/listings/search',
            layout: 'layouts/search-layout',
        });
    },
    seatfillaFlights(req, res) {
        return res.ok({ user: req.user, type: 'SeatfillaFlights' }, {
            view: '/search/listings/search-seatfilla-fights',
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

        sessionObject.market = req.body.userLocation.address.countryCode || req.body.origin.airportCountryId || req.body.userLocation.address.country || (req.user && req.user.address.country);
        sessionObject.currency = req.body.prefferedCurrency || UserSettingsService.getUserCurrencyCodePreference(req);
        sessionObject.locale = req.headers['accept-language'];
        sessionObject.entityId = '';
        sessionObject.checkindate = (req.body.dates && req.body.dates.departure) || (new Date().toISOString().slice(0, 10));
        sessionObject.checkoutdate = (req.body.dates && req.body.dates.arrival) || null;
        sessionObject.guests = ((req.body.ticketInfo && req.body.ticketInfo.numAdultTickets) || 1) +
            ((req.body.ticketInfo && req.body.ticketInfo.numChildTickets) || 0) +
            ((req.body.ticketInfo && req.body.ticketInfo.numInfantTickets) || 0);
        sessionObject.rooms = req.body.numRooms || 1;

        SkyScannerHotelService.initiateFirstSession(sessionObject, hotelRequestObject).then(function(result) {
            return res.ok({ user: req.user, hotelListings: result.body, nextPollUrl: result.url, type: 'Hotels' }, {
                view: '/search/listings/hotels/search-hotels',
                layout: 'layouts/search-layout',
            });
        }).catch(function(err) {
            sails.log.error(err);
            return res.badRequest(err);
        });
    },
    cars(req, res) {

    }
}