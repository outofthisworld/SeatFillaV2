
module.exports = function(req, res, next) {
  jwtService.verifyApiToken(req, function(err, decoded, token){
      if(err) return res.json({
          status: 401,
          message: err.message
        });

      req.options.token = token;
      req.options.tokenPayload = decoded;

      ApiUsers.findOne({token:token}).exec(function(err, apiUser){
            if(apiUser.isVerified) next();
            else return res.json(
                {
                status: 403,
                message: "Unauthorized access, your API key has not been validated yet"
                         + err.message
            });
      });
  });
};