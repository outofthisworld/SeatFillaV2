module.exports = function(req, res, next) {

    sails.log.debug('Checking is own profile policy, username was: ' + req.param('username'))
    
    if(req.param('username') && 
       req.param('username').toLowerCase() == 
       req.user.username.toLowerCase()){
        return next();
    }

    sails.log.debug('Failed is own profile policy.. retruning forbidden');
    return res.forbidden();
}