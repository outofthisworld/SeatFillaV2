module.exports = {
    index(req, res) {
       return res.ok({ user: req.user }, {
            view: 'index',
        });
    },
    login(req,res){
        return res.ok({}, {
            view: 'home/login',
        });
    },
    resend_verification_email(req, res) {
        return res.ok({ user: req.user }, {
             view: 'home/resend-verfication-email',
              layout: 'layout'
             });
    },
    reset_password(req, res) {
        return res.ok({ user: req.user },
         { view: 'home/reset-password.ejs', layout: 'layout' });
    },
    invalid_details(req, res) {
        return res.ok();
    }
}