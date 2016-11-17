module.exports = function(req,res,next){
    if(req.session.success){
        sails.log.debug('has success');
        sails.log.debug(req.flash('success'))
        delete req.session.success;
        return next();
    }
    sails.log.debug('doesnt have success');
    return res.redirect(req.options.successExpiredRedirect);
}