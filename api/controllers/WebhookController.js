module.exports = {

    /*
        Provider logged in policy
    */
    create(req, res) {
        sails.log.debug('In webhook/create');
        if(req.isGET()) return res.ok();
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
                req.flash('id',webhook.id)
                res.redirect(req.param('redirectSuccess') ||
                 req.options.redirectSuccess || 
                 'provider/webhook/createSuccess');
                return Promise.resolve();
            }).catch(function(err) {
                return Promise.reject([err]);
            })
        }).catch(function(errors) {
            if (req.wantsJSON) {
                return res.badRequest(errors);
            }
            req.flash('danger', errors);
            return res.redirect(req.param('redirectFailiure') || 
            req.options.redirectFailiure ||
             'provider/webhook/createFailiure')
        })
    },
    find(req,res){
        const apiUser = ProviderService.getApiUser(req);
        sails.log.debug('found api user')
        sails.log.debug(apiUser)
        Webhook.find({apiUser:apiUser.apiToken}).populate('routes').then(function(webhooks){
            return res.ok({webhooks},{view:'webhook/find'})
        }).catch(function(err){
            sails.log.error(err);
            return res.badRequest(err);
        })
    },
    sendWebhookVerification(req, res) {

        const errors = []

        if(!req.param('id')) errors.push('No id param specified');
        if(!req.param('url')) errors.push('No url specified');

        if(errors.length){
            return res.badRequest({error:new Error('Bad Request'),errors})
        }

        WebhookService.sendWebhookVerification(req.param('id'), req.param('url'))
            .then(function(result) {
                if(!result.isVerified){
                    return res.redirect('provider/webhook/'+result.id+'/verifyWebhook')
                }else{
                    return res.redirect('provider/webhook/')
                }
            }).catch(function(err) {
                sails.log.error(err)
                req.flash('info','The following error occurred trying to contact the specified endpoint: ' + err.message)
                return res.redirect('back')
            })
    },
    verifyWebhook(req, res) {
        if(!req.param('id')) return res.badRequest('No id');

        if(req.isGET()) return res.ok({webHookId:req.param('id')})

        if(!req.param('verificationToken')) 
            return res.badRequest('No verifcation token suppied');

        WebhookService.verifyWebhook({
            webHookId: req.param('id'),
            token: req.param('verificationToken')
        }).then(function(result) {
            if (result && result.isVerified) {
                req.flash('info','Successfully verified webhook endpoint ' + result.url + '. You will now recieve webhook events for routes checked when creating the webhook.');
                return res.redirect('provider/webhook/')
            } else {
                sails.log.debug(result)
                req.flash('danger','Invalid state')
                return res.redirect('provider/webhook/')
            }
        }).catch(function(err) {
            sails.log.error(err);
            req.flash('danger','Something went wrong verifying your webhook: ' + err.message)
            return res.redirect('provider/webhook/')
        })
    },
    destroy() {

    }
}