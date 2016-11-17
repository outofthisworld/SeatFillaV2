/**
 * RequestController
 *
 * @description :: Server-side logic for managing Requests
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    create: function(req, res){

    },
    accept:function(req,res){
        const flightRequestId = req.param('flightRequestId');

        const errors = []
        if(!req.param('hours'))
            errors.push('Missing param hours')

        var hours;
        try{
            hours = parseInt(req.param('hours'));
            if(hours < 12) errors.push('Invalid hours value specified');
        }catch(err){
            errors.push('Invalid hours value specified');
        }

        if(errors.length){
            return res.ok(400,{error:errors});
        }
        
        async.waterfall([
            function locateFlightRequest(callback){
                FlightRequest.findOne({id:flightRequestId})
                .populate('user')
                .then(function(flightRequest){
                    if(!flightRequest) return callback(new Error('Invalid flight request id'),null);
                    return callback(null,flightRequest);
                }).catch(callback)
            },
            function acceptFlightRequest(flightRequest,callback){
                //Use server date to stop inconsistencies from client side dates
                //we can then either: provide a select
                //which has `days` `hours` `weeks` and converts them into an hours format
                //OR alternatively provide a date time field and subtract the current datetime
                //client side, convert it to hours and send it through to this controller action.
                const today = new Date();
                today.setHours(today.getHours()+hours);
                AcceptedFlightRequest.findOrCreate(
                    { flightRequest:flightRequest.id },
                    {
                        flightRequest:flightRequest.id,
                        validUntil:today.toISOString(),
                        apiUser:req.options.apiUser.apiToken
                    }
                ).populate('apiUser').then(function(acceptedFlightRequest){
                    if(!acceptedFlightRequest) callback(new Error('Invalid state'));
                    else return callback(null,{flightRequest,acceptedFlightRequest});
                }).catch(callback)
                },
                function sendUserEmail(flightRequests,callback){
                    EmailService.sendEmailAsync(sails.config.email.messageTemplates.flightRequestAccepted(flightRequests))
                    .then(function (info) {
                        callback(null,Object.extend(flightRequests,info));
                    }).catch(callback);
                }
            ],function(err,results){
                if(err){
                    return res.ok(400,err);
                }else{
                    return res.ok(results)
                }
            })
        }
};

