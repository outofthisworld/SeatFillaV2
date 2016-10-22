/*
    A policy to check that the domain that a 
*/
module.exports = function(req, res, next) {

    const host = req.headers['host'];

    sails.log.debug('Checking white listed domain policy for request to ' + host);

    if (host.startsWith('www.'))
        host = host.slice(4, whiteListedDomain.length);

    for (key in sails.config.domainWhitelist) {
        if (sails.config.domainWhitelist[key]) {
            return next();
        }
    }

    sails.log.debug('(policy/whiteListedDomainPolicy.js) Invalid request made from'
     + req.ip + ', originating domain was ' + host  + 'this is not in the acceptable range of white listed domains.');
    return res.forbidden('Unknown originating domain');
}