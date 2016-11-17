  $(document).ready(function() {
    (function(io,options){
      if(!io) throw new Error('Could not find dependency IO.');
      const currentUserProfileUser = window.seatfilla.globals.userprofile.getCurrentUserProfileUser(window.location);

      function eventHandler(user){
          console.log('Current user profile user: ' + JSON.stringify(user))
          attachCommentListener(user);
      }

      function attachCommentListener(user){

      }

      io.socket.on('user',function(response){
          console.log(response);
          if(!response.verb) return;
          ({
              created:function(){

              },
              updated:function(){

              },
              addedTo:function(){
                  const assocaited = response.association;
              }
          })[response.verb]
      })


      io.socket.get('/user?username='+currentUserProfileUser, eventHandler);
    })(window.io,{

    })
  })