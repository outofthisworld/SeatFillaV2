const request = require("supertest");


describe("Paypal controller tests",function(){

    describe("Succesfully stores a credit card",function(){
        it("Stores a credit card :",function(done){
            this.timeout(15000)

            request(sails.hooks.http.app)
            .post("/paypal/storeCreditCard")
            .set("Accept", "application/json")
            .send({
                //Paypal API sandbox number
                "ccPartOne":"4801",
                "ccPartTwo":"0100",
                "ccPartThree":"5766",
                "ccPartFour":"7661",
                "expire_month":12,
                "expire_year":2021,
                "first_name":"dale",
                "last_name":"appleby"
            }).end(function(err,res){
                if(err) {
                    sails.log.debug('Error: ')
                    sails.log.error(err);
                    return done(err);
                }
                sails.log.debug(res);

                sails.log.debug('Response:')
                sails.log.debug(res.body);
                if(res.body.status == "success"){
                    return done()
                }else{
                    return done(new Error("Invalid response"))
                }
            })

        })
    })
})
