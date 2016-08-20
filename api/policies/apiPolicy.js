
module.exports = function(req, res, next) {
  jwtService.verifyApiToken(req, function(err, decoded, token){
      if(err){ 
          sails.log.debug('Could not verify API token in policies/apiPolicy.js');
          return res.json({status: 401,message: err.message});
      }

      req.options.token = token;
      req.options.tokenPayload = decoded;

      ApiUsers.findOne({token:token}).exec(function(err, apiUser){
            if(!err && apiUser.isVerified) {
                 sails.log.debug('Succesfully authenticated API token in policies/apiPolicy.js');
                 return next();
            }
            return res.json({error: err, message: "Unauthorized access, your API key has not been validated yet " + err.message
         });
      });
  });
};