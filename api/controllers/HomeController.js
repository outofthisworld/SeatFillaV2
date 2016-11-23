module.exports = {
    index(req, res) {
        GettyImagesService.searchAndRetrieveUrls({
            phrase: 'city' + ' hotel',
            page: 1,
            pageSize: 100
        }).then(function(result) {
            sails.log.debug('Result was : ' + JSON.stringify(result))
            return res.ok({
                user: req.user,
                images: result
            }, {
                view: 'index',
            });
        }).catch(function(err) {
            return res.badRequest();
        })
    },
    login(req, res) {
        return res.ok({
            redirectSuccess: req.param('redirectSuccess')
        }, {
            view: 'home/login',
        });
    },
    resendVerificationEmail(req, res) {
        return res.ok({
            user: req.user
        }, {
            view: 'home/resend-verfication-email',
        });
    },
    resetPassword(req, res) {
        return res.ok({
            user: req.user
        }, {
            view: 'home/reset-password.ejs',
            layout: 'layout'
        });
    },
    register(req, res) {
        return res.ok({
            user: req.user
        });
    }
}