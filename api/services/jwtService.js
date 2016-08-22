/*
    Created by Dale
  
   NOTES:
   Supply a secret key, this will call createApiToken....
   Signs the token with server half + user half (user is responsible for keeping his half safe)
   The payload for the api token should include:
            *** The userID the API token is associated with ***
            *** The permissions associated with the token ***

   The user will then need to send the sfKey in the request along with the generated sfToken.
   Consequently we can store the API key in our database, since its of no use to a hacker without the user half of the key
   (Just the token itself will will cause verifyToken to fail because the underlying HMAC algorithm will fail).
   We want to be able to store the generated API key in the database, because API keys in SeatFilla will need to be verfied.
*/       


//Require the jwt module
const jwt = require('jsonwebtoken');

//Required the UUID module
const uuid = require('node-uuid');

//Our secret API key, (remember to move this to our config files later when can be bothered >:) )
const apiKey = "secret-half";

const createApiSecret = function (apiKey,sharedSecret){
    return sails.config.session.secret+sharedSecret;
}

module.exports = {

        //Create an api token from the given request and payload
        createApiToken:function(req, payload, cb){
            //Grab the key..
            const key = req.body.sfKey || req.query.sfKey || req.headers['x-seatfilla-key'] || req.params.sfKey;
            
            //If we have the payload and the key...
            if(payload && key){
                //Sign it and return.
                return cb(null, jwt.sign(payload, createApiSecret(apiKey, key)));
            }else{
                //Something went wrong.. lets debug.
                sails.log.debug('Error creating API token in services/jwtService.js')
                //return control, call callback.
                return cb(new Error('Did not recieve all information required for creating API token'), null);
            }
        },

        //Verify an api token.
        verifyApiToken:function(req, cb){

            //Grab the token and the key
            const token = req.param('sfToken') || req.headers['x-access-token'];
            const key = req.param('sfKey') || req.headers['x-seatfilla-key'];

            //We haven't been supplied with the right information.. return.
            if(!token || !key){
                 return cb(new Error('Missing token or key'));
            }

            //Lets verify our token... and return to the callers cb.
            jwt.verify(token, createApiSecret(apiKey,key), (err, decoded)=>{  
                if(err) return cb(err) 
                else return cb(null, decoded, token); 
            });
        }
};

