module.exports = function(req, res, next) {

    sails.log.debug('Checking is own profile policy, username was: ' + req.param('username'))
    
    if(req.param('username') && 
       req.param('username').toLowerCase() == 
       req.user.username.toLowerCase()){
        return next();
    }

    return res.redirect(req.path.replace(':username',req.user.username));
}