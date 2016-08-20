/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


const passport = require('passport');

module.exports = {

    //Authenticate users for local logins (see passport.js)
    local: function(req,res){
        //if(!req.isPOST()) return res.badRequest();
        
        passport.authenticate('local', function(err, user, message){

            if(err || !user) return res.negotiate({error:err, message:message });

            req.login(user, function(err) {
                if (err){ 
                    sails.log.debug('Failed to log on user to req in controllers/authcontroller.js');
                    return res.negotiate(err);
                }
            
                sails.log.debug('Succesfully logged on user via passport in controllers/authcontroller.js');
                return res.send({message: message, user: user});
            });

           // return res.ok({user:req.user}, { view:'/Dashboard', title:'Dashboard'});
        })(req,res);
    },

    //Generates an API token (a JSON web token that is signed using HMAC to ensure integrity). 
    generateApiToken: function(req,res){
        jwtService.createApiToken(req, {
            id:req.user.id,
            permissions:['all'],
            iat: Math.floor(Date.now() / 1000) - 30,
            aud:'SeatFilla',
            sub:'SeatfillaApiToken'
        }, function(err,token){
            if(err) {
                sails.log.debug('Error generating API token, controllers/authcontroller.js');
                return res.json({error:err,errorMessage:err.message});
            }else{
                ApiUsers.create(
                {
                    apiToken:token,
                    user: req.user.id
                }).exec(function(err,record){
                    if(err){
                        sails.log.debug('Error creating ApiUser in controllers/authcontroller.js');
                        return res.json({error:err,errorMessage:err.message});
                    }
                    return res.json({message:"Succesfully created API token, it will be validated shortly", token:token});
                });
            }
        });
    },
    facebook:function(){

    },


    facebookCallback: function(){
          
    }
};

