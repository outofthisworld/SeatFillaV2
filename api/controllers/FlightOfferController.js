/**
 * FlightOfferController
 *
 * @description :: Server-side logic for managing Flightoffers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    //Get
    flights:function(req,res){
        

    },
    create:function(req,res){
        //Note we do not have to check if the are authorized, this is done in the polcies
        FlightRequest.create(req.allParams()).exec(function(err,flightRequest){
            if(err) return res.negotiate(err);
            else return res.created({flightRequest:flightRequest},"view");
        });
       res.ok({},"myview");
    }
    
	
};

