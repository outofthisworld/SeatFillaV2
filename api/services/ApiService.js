    /*
        CREATED BY DALE
      
    RESTFUL API TOKEN GENERATION USING JSON WEB TOKENS (INDUSTRY STANDARD RFC 7519). 
    THIS ALLOWS DEVELOPERS TO CONTROL WHO IS AUTHORIZED TO ACCESS CERTAIN METHODS WITHIN THE RESTFUL API, 
    AND ALSO ASSOCIATE REQUESTS WITH A PARTICULAR USER. THEY CAN BE USED FOR BOTH AUTHENTICATION AND AUTHORIZATION 
    AND ARE BECOMING POPULAR AS THEY ALLOW DEVELOPERS TO CREATE GRANULAR PERMISSIONS AND ACCESS TO RESOURCES, 
    SIMILAR TO WHEN A DBA ADMINISTRATES SINGLE USER DATABASE PERMISSIONS FOR CREATING, READING, UPDATING, DELETING AND DROPPING TABLES.
    THE WAY THEY WORK IS BY USING BASE64 - A BINARY TO STRING ENCODING ALGORITHM - 
    ON BOTH A HEADER (CONSISTING OF AN ALGORITHM AND CERTAIN OTHER ATTRIBUTES) AND A PAYLOAD, 
    WHICH CAN CONTAIN ANY INFORMATION REQUIRED BY THE APPLICATION E.G. APPLICATION SPECIFIC INFORMATION. 
    FOR THIS PROJECT, WE ENCODED THE PERMISSIONS A CERTAIN TOKEN (OR USER OF A TOKEN) HAS WHEN ACCESSING 
    API ROUTES INTO THE PAYLOAD AND THE USER THAT THE TOKEN WAS GENERATED BY SO WE COULD ASSOCIATE IT WITH A 
    PARTICULAR USER LATER WHEN A HTTP REQUEST IS MADE TO THE UNDERLYING PLATFORMS API.  AFTER BOTH THE HEADER AND THE 
    PAYLOAD HAVE BEEN ENCODED IN BASE64, THEY ARE APPENDED VIA A SEPARATOR ‘.’ AND SIGNED USING A CRYPTOGRAPHIC HASH FUNCTION 
    (IN THE CASE OF THIS PROJECT, HMACSHA256 WAS USED AS THE HASH FUNCTION). THE HASH FUNCTION IS DESIGNED TO PROTECT THE MESSAGE
    FROM BEING TAMPERED WITH, BUT INFORMATION WITHIN THE MESSAGE CAN STILL BE SEEN BY PRYING EYES BY SIMPLY BASE64 DECODING THE FIRST
    TWO PARTS OF THE TOKEN. AS SUCH, CONFIDENTIAL INFORMATION SUCH AS PASSWORDS, SHOULD NOT BE STORED WITHIN THE PAYLOAD OR HEADER. 
    THE HASH FUNCTION TAKES A SECRET KEY AS INPUT WHICH CAN BE GENERATED ON THE SERVER AND KEPT SAFE. IF THE SECRET KEY BECOMES COMPROMISED, 
    IT SHOULD BE IMMEDIATELY ROTATED. AN EXAMPLE OF HOW THE THE PAYLOAD AND HEADER ARE SIGNED BY THE HMAC ALGORITHM IS SHOWN BELOW:
    
    HMACSHA256(
      BASE64URLENCODE(HEADER) + "." +
      BASE64URLENCODE(PAYLOAD),
      SECRET //
    )
    
    THE END RESULT OF THIS IS A TOKEN WITH 3 PARTS, WHICH LOOKS SOMETHING LIKE:
    
    	EYJHBGCIOIJIUZI1NIISINR5CCI6IKPXVCJ9.EYJZDWIIOIIXMJM0NTY3ODKWIIWIBMFTZSI6IKPVAG4GRG9LIIWIYWRTAW4IONRYDWV9.TJVA95ORM7E2CBAB30RMHRHDCEFXJOYZGEFONFH7HGQ
    
    ALTHOUGH THE TOKEN IS INHERENTLY SAFE, AS THE SECRET USED FOR THE CRYPTOGRAPHIC HASH FUNCTION IS STORED ON THE SERVER
    (IN A EXTERNAL FILE,  CONFIG FILE ECT) WE DECIDED TO MAKE IT EVEN SAFER, BY MAKING EACH API TOKEN SIGNED WITH A DIFFERENT SECRET. 
    TO DO THIS, API USERS ARE RESPONSIBLE FOR SUPPLYING HALF OF THE SECRET USED IN CRYPTOGRAPHIC HASH ALGORITHM. THIS ‘USER-HALF’ OF THE SECRET KEY 
    IS NOT STORED ANYWHERE BY OUR PLATFORM ITSELF, IT IS UP TO THE USER TO RETAIN THIS SECRET KEY AND SUPPLY IT ON EACH REQUEST SO THAT WE CAN SUCCESSFULLY 
    VERIFY THE PAYLOAD AND HEADER. WITHOUT THE USER HALF OF THE SECRET, DECODING THE HEADER AND PAYLOAD IS POSSIBLE,
    BUT VERIFICATION OF THE TOKEN BY OUR PLATFORM WILL FAIL. THE USER HALF OF THE SECRET ALSO HAS THE ADDED BENEFIT THAT ANY API TOKENS STORED WITHIN OUR DATABASE ARE 
    USELESS AND UNUSABLE UNLESS THE USER HALF OF THE SECRET KEY IS ALSO COMPROMISED, WHICH WOULD BE AN UNLIKELY SITUATION AS IT IS NOT STORED ON THE SERVER.
    API TOKENS ARE STORED WITHIN OUR DATABASE TO ENABLE US TO TRACK WHICH USERS USE CERTAIN ROUTES WITHIN THE API, AND INVALIDATE THE USE OF THE API KEY
    AS A WHOLE (SHOULD IT BE USED FOR IMPROPER PURPOSES) BY SETTING A BOOLEAN FLAG WITHIN THE MODEL WHERE THE API KEYS ARE STORED. 
    
    */
    
    
    //Require the jwt module
    const jwt = require('jsonwebtoken');
    
    //Required the UUID module
    const uuid = require('node-uuid');
    
    //Our secret API key, (remember to move this to our config files later when can be bothered >:) )
    const apiKey = "secret-half";
    
    const createApiSecret = function(apiKey, sharedSecret) {
        return sails.config.session.secret + sharedSecret;
    }
    
    module.exports = {
    
        //Create an api token from the given request and payload
        createApiToken: function(req, payload, cb) {
            //Grab the key..
            const key = req.body.sfKey || req.query.sfKey || req.headers['x-seatfilla-key'] || req.params.sfKey;
    
            //If we have the payload and the key...
            if (payload && key) {
                //Sign it and return.
                return cb(null, jwt.sign(payload, createApiSecret(apiKey, key)));
            }
            else {
                //Something went wrong.. lets debug.
                sails.log.debug('Error creating API token in services/jwtService.js')
                    //return control, call callback.
                return cb(new Error('Did not recieve all information required for creating API token'), null);
            }
        },
    
        //Verify an api token.
        verifyApiToken: function(req, cb) {
    
            //Grab the token and the key
            const token = req.param('sfToken') || req.headers['x-access-token'];
            const key = req.param('sfKey') || req.headers['x-seatfilla-key'];
    
            //We haven't been supplied with the right information.. return.
            if (!token || !key) {
                return cb(new Error('Missing token or key'));
            }
    
            //Lets verify our token... and return to the callers cb.
            jwt.verify(token, createApiSecret(apiKey, key), (err, decoded) => {
                if (err) return cb(err)
                else return cb(null, decoded, token);
            });
        },
        createApiUser:function(user, apiToken){
            return new Promise(function(resolve,reject){
                ApiUsers.create({
                    apiToken: apiToken,
                    isVerified: false,
                    isBlocked: false,
                    user: user.id,
                }).exec(function(err,ApiUser){
                    if(err) return reject(err)
                    else return resolve(ApiUser);
                })
            })
        }
      }
    };
