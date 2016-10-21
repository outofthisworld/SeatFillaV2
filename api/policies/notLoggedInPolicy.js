module.exports = function(req, res, next) {
     if(req.user){
        sails.log.debug('User logged in.. logging out');
        req.flash('info', 'Please re-validate your credentials')
        req.user.logout();
     }
     return next();  
}