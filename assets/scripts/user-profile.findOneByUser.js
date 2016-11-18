$(document).ready(function(){
    $('.commentForm').on('click',function(){
           $.seatfilla.userprofile.sendUserProfileCommentToServer(null,$(this).val(),function(err){
               if(err){
                    //Notify error to user
               }else{
                   //Do something,
               }
           })
    })

    $('.replyForm').on('click',function(){
         $.seatfilla.userprofile.sendUserProfileCommentToServer($(this).attr('data-attr-parentCommentId'),$(this).val(),function(err){
               if(err){
                    //Notify error to user
               }else{
                   //Do something,
               }
           })
    })
})