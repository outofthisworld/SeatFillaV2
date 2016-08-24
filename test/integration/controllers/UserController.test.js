const request = require('supertest')
const assert = require('assert');

describe('User controller tests', function () {
  describe('POST /user/create', function () {
    it('respond with json', function (done) {

      User.destroy({email:'dale@farpoint.co.nz'}).exec(function(err){
        if(err){
          return done(err);
        }
      });

      request(sails.hooks.http.app)
        .post('/user/create')
        .set('Accept', 'application/json')
        .send({
            username:'BlackJem',
            password:'testpassword',
            passwordConfirmation:'testpassword',
            birthDay:'24',
            birthMonth:'11',
            birthYear:'1993',
            provider:'local',
            firstName:'Dale',
            lastName:'Stephen',
            middleName:'Appleby',
            email:'dale@farpoint.co.nz',
            isLockedOut:false,
            isEmailVerified:false
        })
        .end(function (err, res) {
          if (err) return done(err)
          if (res.error) return done(res.body.error)
          
          sails.log.debug(res.body);
          assert(res.body.user);
          sails.log.debug(res.body.user);

          done();
        })
    })
  })
})
