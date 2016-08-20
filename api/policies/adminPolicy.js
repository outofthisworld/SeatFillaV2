


module.exports = function(req, res, next) {
    if((req.isAuthenticated || req.isAuthenticated()) && (req.session.user && req.user.hasRole('admin'))){
        sails.log.debug('Succesfully authenticated admin');
        return next();  
    }

   sails.log.debug('Admin policy failiure in policies/adminPolicy.js');

   return res.forbidden('You are not permitted to perform this action.');
}