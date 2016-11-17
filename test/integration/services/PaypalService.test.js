describe('PaypalService tests',function(){

    describe('Succesfully stores a credit card and then charges it',function(){

        it('Stores and charges a credit card',function(done){
            this.timeout(60000);

            async.waterfall(
            
            [
                function storeCreditCard(callback){
                    PaypalService.storeCreditCard({
                        //Paypal API sandbox number
                        "number":"4801010057667661",
                        "payer_id":"3951b2a1-968c-4c42-ab5f-4aa9f117e6df",
                        "expire_month":12,
                        "expire_year":2021,
                        "first_name":"dale",
                        "last_name":"appleby",
                        "type":"visa",
                    }).then(function(response){      
                        return callback(null,response)
                    }).catch(function(err){
                        return callback(err,null);
                    })
                 },
                 function chargeCreditCard(response,callback){
                     if(!response.credit_card.id)
                        return callback(new Error('Invalid response from store credit card'),null);

                     sails.log.debug('response in charge credit card : ' + JSON.stringify(response))
                     PaypalService.charge_credit_card([{
                        "amount": {
                        "total": "6.70",
                        "currency": "USD"
                        },
                        "description": "This is the payment transaction description."
                     }],
                     {
                         credit_card_id:response.credit_card.id
                     }).then(function(response){
                         sails.log.debug('Recieved response charging credit card: ' + response);
                         if(response.state == 'approved')
                     }).catch(function(err){
                         sails.log.debug('Error charing credit card: ')
                         sails.log.error(err);
                         return callback(err,null)
                     })
                 }
        ],function(err,results){
            if(err){
                done(err);
            }else{
                done();
            }
        })
      })
    })
})