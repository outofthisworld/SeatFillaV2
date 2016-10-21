module.exports = function(req,res,done){
    if(req.session.providerlogin){
        sails.log.debug('Logging out from provider');
        delete req.session.providerlogin;
    }
    done();
}
