module.exports = function(req, res, next) {
    if (req.user) {
        req.flash('info', 'Please re-validate your credentials');
        sails.log.debug('User logged in.. logging out');
        req.logOut();
    }
    if (ProviderService.isAuthenticated(req)) {
        sails.log.debug('Logging out from provider');
        ProviderService.logout(req);
    } else {
        sails.log.debug('Not logged into provider, not logging out');
    }
    return next();
}