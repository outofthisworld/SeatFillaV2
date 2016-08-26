
/*
    Tests for our email service.
    Created by dale.
*/

describe('EmailService tests',function(){




    describe('Send Email',function(){
        it('Sends an email',function(done){
              var email = {
                to: ['dale@farpoint.co.nz'],
                from: 'SeatFilla.com',
                subject: 'SeatFilla',
                text: 'Awesome sauce',
                html: '<b>Awesome sauce</b>'
            }

            EmailService.sendEmailAsync(email).then(function (info) {
                done();
            }).catch(function (err) {
                done(err);
            });
        });
    });

});