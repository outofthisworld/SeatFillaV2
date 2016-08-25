


describe('User service tests',function(){
    describe('test create and remove user',function(){
        var id;
        it('creates a user',function(done){
            const req ={
                allParams:function(){
                    return {
                          username:'TestUser123',
                          password:'testpassword',
                          passwordConfirmation:'testpassword',
                          birthDay:'24',
                          birthMonth:'11',
                          birthYear:'1993',
                          provider:'local',
                          firstName:'Dale',
                          lastName:'Stephen',
                          middleName:'Appleby',
                          email:'dale123@farpoint.co.nz',
                          isLockedOut:false,
                          isEmailVerified:false,
                          ip:'127.0.0.1'
                    }
                },
                headers:{
                    'user-agent':'headless SfClient/OSX v.20'
                }
            }

            UserService.create(req).then(function(user){
                return id = user.id;
            }).then(function(id){
               User.find(id).exec(function(err,user){
                   if(err) return done(err);
                   else if(user) return done();
               });
            }).catch(function(err){
                return done(err);
            });
        });

        it('deletes the created user',function(done){
            UserService.deleteUser()
        });

    });



});