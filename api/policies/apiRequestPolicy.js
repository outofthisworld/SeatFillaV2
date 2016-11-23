module.exports = function(req, res, next) {
    //Keeps track of any requests to our API, note that this policy
    //should ALWAYS be run after the apiPolicy, as that verifies the token exists
    //for any calls to the underlying API.
    ApiService.createApiRequest({
        path: req.path,
        request: req
    }).then(function(request) {
        sails.log.debug('New api request created ' + request);
        return next();
    }).catch(function(err) {
        sails.log.debug('Error when creating a new API request');
        return res.json({
            error: err,
            errorMessage: err.message
        });
    })
}