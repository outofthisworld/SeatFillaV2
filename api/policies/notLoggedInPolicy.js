module.exports = function(req, res, next) {
    if (req.user) {
        sails.log.debug('User logged in.. logging out');
        req.logOut();
        req.flash('info', 'Please re-validate your credentials')
    }
    return next();
}