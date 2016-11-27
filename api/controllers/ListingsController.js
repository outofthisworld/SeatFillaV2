module.exports = {
    home(req, res) {
        return res.ok({
            user: req.user
        }, {
            view: 'search/listings/flights/search-seatfilla-flights',
            layout: 'layouts/search-layout'
        })
    },
    flights(req, res) {
        return res.ok({
            user: req.user,
            type: 'Flights'
        }, {
            view: '/search/listings/search-flights',
            layout: 'layouts/search-layout'
        })
    },
    cars(req, res) {}
}
