module.exports = {
    index(req, res) {
       return res.ok({ user: req.user }, {
            view: 'index',
        });
    }
}