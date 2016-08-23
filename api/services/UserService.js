
module.exports = {
    createUser: function(obj){
       obj.provider = 'local';
       User.create(obj).exec(function(err,user){
           if(err || !user){
               sails.log.info('Error when creating user ', err)
               return res.negotiate(err);
           } else {
               delete user.password;
               delete user.passwordConfirmation;

               sails.log.info('Created user, redirecting.');
               if(res.wantsJSON()){
                    return res.ok({user:user},"index");
               }else{
                return res.ok({user:req.session.user}, { view:'user/myaccount', title:'My Account'});
               }
           }
       });
    }

}