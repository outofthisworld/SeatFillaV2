module.exports = {

    /*
        Provider logged in policy
    */
    create(req, res) {
        return new Promise(function(resolve, reject) {
            sails.log.debug(JSON.stringify(req.options));

            const errors = [];

            const url = req.param('url');
            if (!url || !url.startsWith('http://')) {
                errors.push('Invalid url supplied')
            }

            if (errors.length) {
                return reject(errors);
            }

            const apiUser = ProviderService.getApiUser(req);
            const message = require('node-uuid').v4();
            const algorithm = req.param('algorithm') || 'blowfish';
            const key = req.param('key') || require('node-uuid').v4();
            sails.log.debug('Creating webhook, params: ' + JSON.stringify(req.allParams()))
            return WebhookService.createWebHook(req.param('url'),
                key,
                message,
                algorithm,
                apiUser, {
                    webHookTypes: Object.keys(req.allParams())
                }).then(function(webhook) {
                req.session.success = true;
                req.flash('sfVerificationParam', webhook.sfVerificationParam);
                req.flash('message', message);
                req.flash('key', key);
                req.flash('algorithm', algorithm);
                res.redirect(req.param('redirectSuccess') || req.options.redirectSuccess);
                return Promise.resolve();
            }).catch(function(err) {
                return Promise.reject(err);
            })
        }).catch(function(errors) {
            if (req.wantsJSON) {
                return res.badRequest(errors);
            }
            req.flash('danger', errors);
            return res.redirect(req.param('redirectFailiure') || req.options.redirectFailiure)
        })
    },
    sendWebhookVerification(req, res) {
        if (req.isGET()) return res.ok();

        WebhookService.sendWebhookVerification(req.param('webHookId'), req.param('webHookVerificationUrl'))
            .then(function(result) {
                return res.ok(result, {
                    view: 'webhook/sendWebhookVerificationSuccess'
                })
            }).catch(function(err) {
                return res.badRequest({
                    error: err
                }, {
                    view: 'webhook/sendWebhookVerificationFailiure'
                })
            })
    },
    verifyWebhook(req, res) {
        if (req.isGET()) return res.ok();

        if (!req.param('webHookId'))
            return res.badRequest('No web hook id supplied');

        WebhookService.verifyWebhook({
            webHookId: req.param('webHookId'),
            token: req.param('verificationToken')
        }).then(function(result) {
            if (result && result.isVerified) {
                return res.ok(result, {
                    view: 'webhook/verificationSuccess'
                })
            } else {
                return res.serverError('Invalid return from webhookservice.js/verifyWebhook')
            }
        }).catch(function(err) {
            return res.badRequest(err);
        })
    },
    destroy() {

    }
}