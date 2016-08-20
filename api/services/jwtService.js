

const jwt = require('jsonwebtoken');
const uuid = require('node-uuid');
const apiKey = "secret-half";

/* Supply a secret key, this will call createApiToken 
   Which will sign the token with server half + user half (user is responsible for keeping his half safe)
   The payload for the api token should include:
            *** The userID the API token is associated with ***
            *** The permissions associated with the token ***

  The user will then need to send the sfKey in the request along with the generated sfToken.

   We can then store the API key in our database, since its of no use to a hacker without the user half of the key
   (Just the token itself will will cause verifyToken to fail because the underlying HMAC algorithm will fail).

   We want to be able to store the generated API key in the database, because API keys in SeatFilla will need to be verfied.
*/       


const createApiSecret = function (apiKey,sharedSecret){
    return Buffer.from(sails.config.session.secret+sharedSecret).toString('base64');
}

module.exports = {
        createApiToken:function(req, payload, cb){
            const key = req.body.sfKey || req.query.sfKey || req.headers['x-seatfilla-key'] || req.params.sfKey;
            if(payload && key){
                cb(null, jwt.sign(payload, createApiSecret(apiKey, key)));
            }else{
                sails.log.debug('Error creating API token in services/jwtService.js')
                cb(new Error('Did not recieve all information required for creating API token'), null);
            }
        },
        verifyApiToken:function(req, cb){
            const token = req.body.sfToken || req.query.sfToken || req.headers['x-access-token'];
            const key = req.body.sfKey || req.query.sfKey || req.headers['x-seatfilla-key'];

            if(token && key){
                jwt.verify(token, createApiSecret(apiKey,key), function(err, decoded) {  
                        if(err) {
                            cb(err) 
                        }else{
                            cb(null, decoded, token);
                        }
                    });
            }else{
                cb(new Error('Missing token or key'));
            }
        }
};

