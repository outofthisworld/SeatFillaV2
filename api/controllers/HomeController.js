module.exports = {
    index(req, res) {
        GettyImagesService.searchAndRetrieveUrls({
          phrase: 'city' + ' hotel',
          page: 1,
          pageSize: 100
        }).then(function(result){
            sails.log.debug('Result was : ' + JSON.stringify(result))
            return res.ok({ user: req.user, images: result }, {
                view: 'index',
            });
        }).catch(function(err){
            return res.badRequest();
        })
    },
    login(req,res){
        return res.ok({}, {
            view: 'home/login',
        });
    },
    resend_verification_email(req, res) {
        return res.ok({ user: req.user }, {
            view: 'home/resend-verfication-email',
        });
    },
    reset_password(req, res) {
        return res.ok({ user: req.user },
         { view: 'home/reset-password.ejs', layout: 'layout' });
    },
    invalid_details(req, res) {
        return res.ok({ user: req.user });
    },
    register(req,res){
        return res.ok({ user: req.user });
    }
}