module.exports = function(sails) {
        return {
            configure: function() {
                // run hook configuration code
            },

            // optional route: attribute to set functionality
            // before and after controller action
            route: {
                after: {
                    '/*': function(req, res, next) {
                        if (req.wantsJSON) {
                            res.body.time = res.body.time || {}
                            res.body.time.requestArrivalTime = req._startTime;
                            res.body.time.responseStartTime = new Date().getTime();
                            res.body.time.executionTime = res.body.time.responseStartTime - res.body.time.requestArrivalTime;
                        }
                        sails.log.debug('After hooks running')
                    }
                }
            }
        }
    }
}