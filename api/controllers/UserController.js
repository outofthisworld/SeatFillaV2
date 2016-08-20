/**
 * UserController
 */

module.exports = {
   //Post
   create:function(req,res){
       //

       req.body.provider = 'local';

       User.create(req.allParams()).exec(function(err,user){
           if(err || !user){
               sails.log.info('Error when creating user ', err)
               return res.negotiate(err);
           } else {

               delete user.password;
               delete user.passwordConfirmation;

               sails.log.info('Created user, redirecting.');
               return res.ok({user:user},"index");
           }
       });
   },
   //Get
   myaccount:function(req,res){
       return res.ok({user:req.session.user}, { view:'user/myaccount', title:'My Account'});
   },
   //Get
   changedetails:function(req,res){
       return res.ok({user:req.session.user}, { view:'user/changedetails', title:'My Account'});
   },
   logout: function (req, res) {
     req.logout();
     req.session.destroy();
     res.redirect('/');
  }
};

