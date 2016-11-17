/**
 * FlightOfferController
 *
 */

const _find = require('../../out/find');
module.exports = {
    find(req,res){
      _find(req,res).then(function(){
        return res.ok();
      }).catch(function(err){
        return res.badRequest(err);
      })
    }
};

