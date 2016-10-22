module.exports = {
    index(req, res) {
       return res.ok({ user: req.user }, {
            view: 'index',
        });
    },
    login(req,res){
        return res.ok({}, {
            view: 'provider-dashboard/login',
        });
    },
    resend_verification_email(req, res) {
        return res.ok({ user: req.user }, { view: 'user/resend-verfication-email', layout: 'layout' });
    },
    reset_password(req, res) {
        return res.ok({ user: req.user }, { view: 'user/reset-password.ejs', layout: 'layout' });
    },
    invalid_details(req, res) {
        return res.ok();
    }
}