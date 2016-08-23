module.exports = function(req, res, next) {
    if((req.isAuthenticated || req.isAuthenticated()) && (req.session.user && req.user.hasRole('moderator'))){
        sails.log.debug('Succesfully authenticated moderator');
        return next();  
    }

   sails.log.debug('Admin policy failiure in policies/moderatorPolicy.js');

   return res.forbidden('You are not permitted to perform this action.');
}