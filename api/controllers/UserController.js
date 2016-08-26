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
                user: user
            });
        }).catch(function(err) {
            sails.log.debug('Error creating user in UserController.js/create ' + err);
            return res.json({
                error: err
            });
        });
    },
    //GET [register an account page]
    register: function(req, res) {

    },
    //GET [complete registraion page]
    completeRegistration: function(req,res){
        return res.ok({user:req.user});
    },
    //POST [update a users details]
    update: function(req,res){

    },
    //GET [return the my account page]
    myAccount: function(req, res) {
        return res.ok({user: req.user }, 
        {
            layout: 'user/myAccount',
            view: 'user/index',
            title: req.__('MyAccount')
        });
    },
    //[Get the change details page]
    changeDetails: function(req, res) {
        return res.ok({
            user: req.user
        }, {
            view: 'user/changedetails',
            title: req.__('ChangeDetails')
        });
    },
    //[Get the reset password page]
    resetPassword: function(req, res) {

    },
    //[Get the resend verification email page.]
    verifyEmail: function(req, res) {

    },
    //[Get the login page]
    login: function(req,res){
        res.redirect('/');
    }
};