

const jwt = require('jsonwebtoken');
const uuid = require('node-uuid');
const apiKey = "secret-half";

/* Click generate and supply a secret key, this will call createApiToken 
   Which will sign the token with server half + user half (user is responsible for keeping his half safe)
   The payload for the api token should include:
            *** The userID the API token is associated with ***
            *** The permissions associated with the token ***

  The user will then need to send the sfKey in the request along with the generated sfToken.

   We can then store the API key in our database, since its of no use to a hacker without the user half of the key
   (Just the token itself will will cause verifyToken to fail because the underlying HMAC algorithm will fail).

   We want to be able to store the generated API key in the database, because API keys in SeatFilla will need to be verfied.
*/       

module.exports.createApiToken = function(req, payload, callback){
     var key = req.body.sfKey || req.query.sfKey || req.headers['x-seatfilla-key'] || req.cookies.sfKey;

     if(payload && secret && key){
         return cb(null,jwt.sign(payload, createSharedSecret(apiKey, sharedSecret)));
     }else{
         return cb(new Error('Did not recieve all information required..'));
     }
}

function createApiSecret(apiKey,sharedSecret){
    return Buffer.from(apiKey+sharedSecret).toString('base64');
}

module.exports.verify = function(req, cb){
  var token = req.body.sfToken || req.query.sfToken || req.headers['x-access-token'];
  var key = req.body.sfKey || req.query.sfKey || req.headers['x-seatfilla-key'];

  //We've received an api request...
  if(token && key){
       jwt.verify(token, createApiSecret(apiKey,key), function(err, decoded) {  
            if(err) return cb(err) 
            else return cb(null, decoded);
        });
  }else{
      cb(new Error('Unauthroized access.'));
  }
}

