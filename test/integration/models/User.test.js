


//Descibe takes a string and a function that is called back and executed.
//The string defines what the tests do, and can be nested inside one another.
describe('User tests',function(){

    //This is our second level of nesting for descibe functions, it descibes what our tests do
    //in more detail.
    describe('Create users',function(){
        //Remember to call the done function always.
        it('Creates a user', function(done){

        //Creates a new user
        User.create({ //Check model files for corresponding object properties
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
                        
          }).exec(function(err,createdUser){   //Callback function returns error and the created user.

              if(err){ //Checks for error
                  return done(err); //Calls the done function with the error (test failed)
              }else{
                  sails.log.debug('Succesfully created a new user');
                  return done(); //Test passed (no arguments needed)
              }
              
          });
        });

        //How to define another method within descibe
        it('creates user method 2', function(done){
            return done();
        });
    })
});