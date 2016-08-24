module.exports = function(req, res, next) {
    if(!(req.user)){
        sails.log.debug('Passed not log in policy...');
        return next();  
    }

   return res.forbidden('You are not permitted to perform this action.');
}