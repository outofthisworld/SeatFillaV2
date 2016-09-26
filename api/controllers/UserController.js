/**
 * UserController
 */

module.exports = {
    //Post [create a user]
    create: function(req, res) {
        sails.log.debug('in user/create');
        UserService.createUser(req).then(function(user) {
            sails.log.debug('Succesfully created user ' + user);
            return res.json({
                status: 200,
                user: user.user,
                address: user.address
            });
        }).catch(function(err) {
            sails.log.debug('Error creating user in UserController.js/create ' + err);
            return res.json({
                status: 500,
                error: err
            });
        });
    },
    //GET [complete registraion page]
    complete_registration: function(req, res) {
        return res.ok({ user: req.user });
    },
    //Get the login page
    login(req, res) {
        if (req.user) req.redirect('/');
        res.ok();
    },
    register(req, res) {
        if (req.user) req.redirect('/');
        return res.ok({}, {
            view: 'user/register',
            title: req.__('MyAccount')
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
};