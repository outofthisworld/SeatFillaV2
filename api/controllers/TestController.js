module.exports = {
    respondWithXml(req, res) {

        return res.ok({
            wantsXml: req.wantsXML,
            iam: {
                avery: 'complex',
                object: {
                    but: 'ishouldbe'
                },
                formated: ['using', 'xml', 'otherwise'],
                thisTest: {
                    will: {
                        'ultimately': ['fail']
                    }
                },
                that: ['would', {
                    not: 'be',
                    very: 'good'
                }]
            },
            arr: ['down', 'up', 'left', 'right'],
            heads: 'shoulds',
            knees: 'andToes'
        })
    },
    respondWithJson(req, res) {
        return res.ok({
            iam: {
                avery: 'complex',
                object: {
                    but: 'ishouldbe'
                },
                formated: ['using', 'xml', 'otherwise'],
                thisTest: {
                    will: {
                        'ultimately': ['fail']
                    }
                },
                that: ['would', {
                    not: 'be',
                    very: 'good'
                }]
            },
            arr: ['down', 'up', 'left', 'right'],
            heads: 'shoulds',
            knees: 'andToes'
        })
    },
    testWebhook(req,res){
        sails.log.debug(req.headers)
        sails.log.debug(req.allParams())
        sails.log.debug(req)
        sails.log.debug('Finished print verifying webhook')
    },
    testWebhookWithVerifyEntered(req,res){
        sails.log.debug(req.headers);
        sails.log.debug(req.allParams());
        return res.ok()
    },
    testWebhookWithVerifyAutomatic(req,res){
        sails.log.debug('test webhook with verify automatic')
        sails.log.debug(req.headers)
        sails.log.debug(req.allParams())
        return res.ok({verificationToken:req.headers['x-seatfilla-web-hook-verification-key']})
    }
}