module.exports = function (req, res, next) {
  sails.log.debug('In api policy')

  try{
    if(ProviderService.getApiUser(req)){
        return next();
    }
  }catch(err){
    return res.badRequest('Sorry, you are not authorized!');
  }

  async.auto({
    check_verified: [function (callback, results) {
      // Verify it is from the right domain.
      ApiUsers.findOne({
        apiToken: ApiService.findApiTokenFromRequest(req)
      }).populate('user').exec(function (err, apiUser) {
        if (!err && apiUser.isVerified && !apiUser.isBlocked) {
          req.login(apiUser.user, function (err) {
            if (err) return callback(err, null)

            sails.log.debug('Succesfully authenticated API token in policies/apiPolicy.js')
            ProviderService.login(req,ApiService.findApiTokenFromRequest(req),ApiService.findApiKeyFromRequest(req))
            .then(function(providerlogin){
                if(!providerlogin){
                    return callback(new Error('Invalid response'))
                }
                return callback(null, providerlogin)
            }).catch(function(err){
                return callback(err,null);
            })
          })
        }else {
          return callback(err || new Error('Unauthorized access, your API key has not been validated yet.'
              + 'For certain permissions, API tokens have to be manually verified.'
              + 'Visit http://localhost:1337/api/documentation for more information.'), null)
        }
      })
    }],
     check_dns: ['check_verified', function (callback, results) {
      (function reverseLookup (ip, requestURL) {
        ip = req.ip.slice(req.ip.lastIndexOf(':') + 1, req.ip.length)

        if (ip == '127.0.0.1') return callback(null, true)

        require('dns').reverse(ip, function (err, domains) {
          if (err) return callback(new Error(err), null)

          const validRequestAddr = false

          domains.forEach(function (domain) {
            sails.log.debug('Checking domain ' + domain)
            if (domain == requestURL) {
              validRequestAddr = true
            }
          })

          if (!validRequestAddr) {
            return callback(new Error('Invalid request address: valid domains ' + JSON.stringify(domains)))
          }
          return callback(null, validRequestAddr)
        })
      })(req.ip, results.check_verified.decoded.requestURL)
    }]
  }, function (err, results) {
      sails.log.debug(results);
    if (!err) {
      return next()
    }else {
      return res.badRequest({status: 400,error: err,errorMessage: err.message})
    }
  })
}
