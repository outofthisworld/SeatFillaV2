module.exports = {
    //Post
    create(req, res) {
        const errorCallback = function(err) { return res.json(ResponseStatus.CLIENT_BAD_REQUEST, { error: err }) }

        ApiService.locateApiUser({ request: req }).then(function(apiUser) {
            req.body.imagePath = '';
            req.body.apiUser = apiUser.id;
            req.body.isApproved = false;

            Advertisements.create(req.body).then(function(ad) {
                return res.json(ResponseStatus.OK, { created: ad })
            }).catch(errorCallback);

        }).catch(errorCallback);
    },
    //delete
    remove(req, res) {

    }
}