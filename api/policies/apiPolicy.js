module.exports = function(req, res, next) {
    ApiService.verifyApiToken(req, function(err, decoded, token) {
        if (err) {
            sails.log.debug('Could not verify API token in policies/apiPolicy.js');
            return res.json({
                status: 500,
                message: err.message
            });
        }

        req.options.token = token;
        req.options.tokenPayload = decoded;

        //Verify it is from the right domain.
        (function reverseLookup(ip, requestURL) {
            dns.reverse(ip, function(err, domains) {
                if (err) callback(err);

                const validRequestAddr = false;

                domains.forEach(function(domain) {
                    if (domain == requestURL) {
                        validRequestAddr = true;
                    }
                });

                if (!validRequestAddr) {
                    return res.json({
                        status: 500,
                        errorMessage: 'Invalid request address: valid domains ' + JSON.stringify(domains)
                    });
                }
            });
        })(req.ip, tokenPayload.requestURL);


        ApiUsers.findOne({
            token: token
        }).exec(function(err, apiUser) {
            if (!err && apiUser.isVerified && !apiUser.isBlocked) {
                sails.log.debug('Succesfully authenticated API token in policies/apiPolicy.js');
                req.options.apiUser = apiUser;
                return next();
            }
            return res.json({
                status: 500,
                error: err,
                errorMessage: "Unauthorized access, your API key has not been validated yet " + err.message
            });
        });
    });
};