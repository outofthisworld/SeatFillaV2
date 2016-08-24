/**
 * Created by Dale.
 * VerifyControllerController
 */

module.exports = {

    //Get
	verify:function(req,res){
        const verificationId = req.param('verificationId');

        Signup.findOne(verificationId).populate('user')
        .exec(function(err,signup){
            const user = signup.user;

            user.isEmailVerified = true;

            user.save(function(err){
                if(err) return res.negotiate(err);
                return res.redirect('user/login');
            });

        });

    }


};

