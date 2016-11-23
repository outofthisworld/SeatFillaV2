module.exports = function(req, res, next) {
    IpBlacklist.find({
        ip: req.ip
    }).then(function(result) {
        if (!result) {
            return next();
        } else {
            sails.log.debug('Returning res.forbidden for blacklisted ip: ' + req.ip);
            return res.forbidden('');
        }
    });
}