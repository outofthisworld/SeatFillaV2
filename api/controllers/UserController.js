/**
 * UserController
 */

module.exports = {
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
};