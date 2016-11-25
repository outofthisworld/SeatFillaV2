/**
 * UserController
 */

const _find = require('../out/find'),
    _update = require('../out/update');
module.exports = {
    create: function(req, res) {
        UserService.createUser(req).then(function(user) {
            NotificationService.sendDedicatedNotificationAsync(req)({
                title: 'You have just signed up to Seatfilla',
                message: 'Thank-you for registering at Seatfilla, be sure to verify your email!',
                link: '/home/resendVerificationEmail'
            });
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
    find(req, res) {
        sails.log.debug('Finding user..');
        _find(req, res).then(function(result) {
            sails.log.debug('Found users via search :' + JSON.stringify(result));
            return res.json(200, result);
        }).catch(function(err) {
            sails.log.error(err);
            return res.json(400, []);
        })
    },
    update(req, res) {
        const UserProfile = req.options.userprofile;
        sails.log.debug('updating user : ' + req.method)
        if (req.isGET()) {
            CreditCard.find({
                    payer_id: req.user.id
                })
                .then(function(cards) {
                    return res.ok({
                        user: req.user,
                        UserProfile,
                        cards
                    }, {
                        renderHtml: true
                    });
                }).catch(function(err){
                    return res.serverError();
                })
        } else if (!(req.user.verifyPassword(req.param('password')))) {
            req.flash('danger', 'Invalid password confirmation');
            return res.ok({
                user: req.user,
                UserProfile
            })
        } else {
            req.deleteParam('id');
            req.deleteParam('password');
            req.deleteParam('username');
            User.update({
                id: req.user.id
            }, req.allParams()).then(function(record) {
                if (!record || !record.length) return Promise.reject('No updated record found');
                req.flash('info', 'Succesfully updated settings')
                sails.log.debug('Returning record: ' + JSON.stringify(record));
                return res.ok({
                    user: record[0],
                    UserProfile
                });
            }).catch(function(err) {
                sails.log.error(err);
                req.flash('toaster-warning', 'Failed to update information');
                if (err.ValidationError) {
                    req.flash('danger', require('../utils/ErrorUtils').friendlyWaterlineError(err));
                } else {
                    req.flash('danger', err.message);
                }
                return res.ok({
                    user: req.user,
                    UserProfile
                })
            })
        }
    },
    getCurrentUser(req, res) {
        if (!req.user) return res.ok({
            status: 404
        });
        else return res.ok({
            status: 200,
            username: req.user.username,
            id: req.user.id
        });
    }
};