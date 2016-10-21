module.exports = {
    index(req,res){
        return res.ok({ user: req.user}, {
            view: 'provider-dashboard/index',
            layout: 'layouts/provider-layout'
        });
    },
    login(req,res){
        return res.ok({}, {
            view: 'provider-dashboard/login',
        });
    },
    authenticate(req,res){
        if(!req.param('apiKey')) res.redirect(req.path);

        AuthenticationService.authenticateLocal(req, res)
        .then(function(result) {
            if(result.status == sails.config.passport.errorCodes().Success){
                if(req.user.apiKeys
                    .filter(function(apiKey){
                        apiKey.token == req.param('apiKey')
                    }
                ).length == 1){
                    req.session.providerlogin = { 
                        isAuthenticated:false, 
                        apiKey: req.param('apiKey')
                    }
                    return Promise.resolve(true);
                }else{
                     return Promise.reject(new Error('Invalid API key'));
                }
            }else{
                return Promise.reject(result.error);
            }
        }).then(function(result){
                req.flash('toaster-success', 'Succesfully logged into the provider panel');
                res.redirect('/provider/index')
        }).catch(function(err){
                req.flash('toaster-warning', 'Error logging in : ' + err.message);
                res.redirect('/provider/login')
        })
    }
}