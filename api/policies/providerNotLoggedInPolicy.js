module.exports = function(req,res,done){

    if(ProviderService.isAuthenticated(req)){
        sails.log.debug('Logging out from provider');
        ProviderService.logout(req);
    }else{
        sails.log.debug('Not logged into provider, not logging out');
    }
    done();
}
