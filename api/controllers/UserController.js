/**
 * UserController
 */

module.exports = {
   //Post
   create:function(req,res){
       //
    
   },
   //Get
   myaccount:function(req,res){
       return res.ok({user:req.user}, { view:'user/myaccount', title:'My Account'});
   },
   //Get
   changedetails:function(req,res){
       return res.ok({user:req.user}, { view:'user/changedetails', title:'Change details'});
   },
   logout: function (req, res) {
     req.logout();
     req.session.destroy();
     res.redirect('/');
  }
};

