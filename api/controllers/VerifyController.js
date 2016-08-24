/**
 * Created by Dale.
 * VerifyControllerController
 */

module.exports = {

    //Get
	email:function(req,res){
        const verificationId = req.param('verificationId');

        Signup.findOne(verificationId).populate('user')
        .exec(function(err,signup){
            const user = signup.user;

            sails.log.debug('Verifying user' + user);
        
            if(!user.isEmailVerified){
                user.isEmailVerified = true;
                user.save(function(err){
                    if(err) return res.badRequest('Something went wrong, could not validate email');
                    return res.redirect('user/login');
                });
            }else{
                return res.badRequest('Email is already verified');
            }

        });

    }


};

