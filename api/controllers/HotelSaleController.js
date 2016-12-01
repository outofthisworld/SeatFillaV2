const _find = require('../out/find')

module.exports = {
    find(req,res){
        _find(req,res).then(function(result){
            const promises = []
            _.each(result,function(hotelSale){
                promises.push(new Promise(function(resolve,reject){
                    HotelService.process_hotel_sale(hotelSale)
                    .then(function(result){
                        return resolve(result);
                    }).catch(function(err){
                        return reject(err);
                    })
                }))
            })

           Promise.all(promises).then(function(results){
               sails.log.debug('Hotel sale controller, results were: ');
               sails.log.debug(results);
               _.filter(results,function(result){
                   return !!result.update_status && !!result.check_status;
               })
           })
        })
    }
}