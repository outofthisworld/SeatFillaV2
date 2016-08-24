const request = require('supertest')
const assert = require('assert');

describe('User controller tests', function () {
  describe('POST /user/create', function () {
    it('respond with json', function (done) {

      User.destroy({username:'BlackJem'}).exec(function(err){
        sails.log.debug('Succesfully destroyed test user');
        assert(!err);
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
            isEmailConfirmed:false
        })
        .end(function (err, res) {
          if (err) return done(err)
          if (res.error) return done(res.error)
          
          assert(res.user);

          done();
        })
    })
  })
})
