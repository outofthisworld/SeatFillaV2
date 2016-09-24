module.exports = {
    all(req, res) {
        return res.ok({ user: req.user }, {
            view: 'search/flights/search',
            layout: 'layouts/flight-search-layout',
        });
    },
    seatfilla(req, res) {
        return res.ok({ user: req.user }, {
            view: 'search/flights/search-seatfilla',
            layout: 'layouts/flight-search-layout',
        });
    }
}