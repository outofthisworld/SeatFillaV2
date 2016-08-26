




describe('User tests',function(){
    describe('Create users',function(){
        it('Creates a user', function(done){

        User.create({
            id: 1234,
            username: 'something',
            password: 'testpassword',
            passwordConfirmation: 'testpassword',
            birthDay: '24',
            birthMonth: '11',
            birthYear: '1993',
            provider: 'local',
            firstName: 'Dale',
            lastName: 'Stephen',
            middleName: 'Appleby',
            email: 'test1@seatfilla.com',
            isLockedOut: false,
            isEmailVerified: false,
            ip: '127.0.0.1'
          }).exec(function(err,createdUser){

              if(err){
                  return done(err);
              }else{
                  sails.log.debug('Succesfully created a new user');
                  return done();
              }
              
          });
        });
    })
});