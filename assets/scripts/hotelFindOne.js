/*

Initializes the hotel script

*/
(function($, io, window) {

    //Check we have our dependencies
    if (!$)
        throw new Error('Jquery not defined');

    if(!$.templates)
        throw new Error('$.templates is not defined');

    if (!io)
        throw new Error('io not defined');

    

    var isInitialized = false;

    //Here we define our hotel script
    window.seatfilla.globals.initHotelScript = function(options) {

        if(!options.id || !options.hotel || !options.hotelInfo || !options.provider)
            throw new Error('Invalid script params ' + JSON.stringify(options)); 


        if (isInitialized) return;

        //Store intialized state
        isInitialized = true;

        console.log('Initializing hotel script with options: ' + JSON.stringify(options))
        console.log(JSON.stringify(options.hotelInfo))
        

        /*
            Attaches event listeners to the dom
        */
        function attachEventListeners() {

            function attach() {

                $('#postComment').on('click', function() {
                    $.ajax({
                        data: {
                            //Data for a hotel user comment
                        },
                        method: 'POST',
                        url: '/hotel/' + options.hotel.id + '/HotelUserComment',
                        success: function(res) {
                            //Handl
                        }
                    })
                })

                 $( "#hotelReviewForm" ).submit(function( event ) {
                        //Prevent the form from submitting
                        event.preventDefault();

                        const rating = $('.btn-review-rating.btn-warning').length;

                        if(rating == 0){
                             $.toaster({ priority : 'warning',  message : 'Please submit a rating with your review'});
                             return;
                        }

                        console.log('sending review')
                        
                        const obj = $('#hotelReviewForm').serialize();
                        obj.title = 'Hello world';
    
                        $.ajax({
                            data: obj,
                            method: 'POST',
                            url: '/hotel/' + options.hotel.id + '/HotelUserComments',
                            success: function(res,r,xhr) {
                                console.log('Recieved response after sending review : ' + res);
                                if(xhr.status == 200){
                                    $.toaster({ priority : 'success',  message : 'Succesfully submitted review'});
                                }else{
                                  $.toaster({ priority : 'warning',  message : 'Failed to submit review'});
                                }
                            },
                            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                                 $.toaster({ priority : 'danger',  message : 'Failed to submit review'});
                                 console.log(errorThrown)
                            }   
                        })

                        $.ajax({
                            data: {
                                rating,
                                hotel:options.hotel.id
                            },
                            method: 'POST',
                            url: '/hotel/' + options.hotel.id + '/HotelUserRating',
                            success: function(res,r,xhr) {
                                console.log('submitting rating ' + res)
                                if(xhr.status == 200){
                                    $.toaster({ priority : 'success',  message : 'Succesfully submitted your rating'});
                                }else{
                                    $.toaster({ priority : 'warning',  message : 'Failed to submit rating with review'});
                                }
                            },
                             error: function(XMLHttpRequest, textStatus, errorThrown) { 
                                 $.toaster({ priority : 'danger',  message : 'Failed to submit rating with review'});
                                 console.log(errorThrown)
                            }
                        })
                });

                $('.replyToComment').on('click', function() {
                    const commentId = $(this).attr('data-attr-parentCommentId');
                    $.ajax({
                        data: {
                            //Data for a comment 
                        },
                        method: 'POST',
                        url: '/HotelUserComment/' + commentId + '/replies/',
                        success: function(res) {

                        }
                    })
                })

                $('#yourRating').on('click', function() {
                    $.ajax({
                        data: {
                            //Data for a hotel user rating
                        },
                        method: 'POST',
                        url: '/hotel/' + options.hotel.id + '/HotelUserRating',
                        success: function(res) {

                        }
                    })
                })

                $('.btn-review-rating').on('click',function(){
                    $('.btn-review-rating').removeClass('btn-warning');
                    const rating = $(this).attr('data-attr-rating'); 
              
                    ($('.btn-review-rating').get()).reverse().slice(5-rating).forEach(
                        function(ele){
                            $(ele).addClass('btn-warning');
                    });
                })
            }

            //Check what state the document is in
            if (document.readyState != 'loading') {
                attach();
            } else {
                document.ready(attach);
            }

        }


        function populateData() {

            const where = { hotel:options.id};

            const hotelInfoWhere = { hotelInfo:options.hotelInfo.id };

            console.log(hotelInfoWhere);

            //Hold the promises we need (combine the results of multiple async `get` requests)
            const promises = [];

            promises.push(new Promise(
                function(resolve,reject){
                    io.socket.get('/HotelUserComment?where=' + JSON.stringify(where), function(res,jwRes) {
                        if(jwRes.statusCode == 200){
                            return resolve(res);
                        }else{
                            return reject(new Error('Error retrieving hotel user comment,' +
                            ' response status was ' + jwRes.statusCode))
                        }
                    })
            }));

            promises.push(new Promise(
                function(resolve,reject){
                    io.socket.get('/HotelUserRating?where=' + JSON.stringify(where), function(res,jwRes) {
                        if(jwRes.statusCode == 200){
                            return resolve(res);
                        }else{
                             return reject(new Error('Error retrieving hotel user rating,' +
                            ' response status was ' + jwRes.statusCode))
                        }
                    })
            }));

            if (options.provider == 'Seatfilla') {

                promises.push(new Promise(
                    function(resolve,reject){
                        io.socket.get('/HotelImage?where=' + JSON.stringify(hotelInfoWhere), function(res,jwRes) {
                              if(jwRes.statusCode == 200){
                                return resolve(res);
                              }else{
                                    return reject(new Error('Error retrieving hotel images,' +
                                    ' response status was ' + jwRes.statusCode))
                              }
                        })
                }));

                promises.push(new Promise(
                      function(resolve,reject){
                           io.socket.get('/HotelTag?where=' + JSON.stringify(hotelInfoWhere), function(res,jwRes) {
                              if(jwRes.statusCode == 200){
                                return resolve(res);
                              }else{
                                return reject(new Error('Error retrieving hotel tags,' +
                                ' response status was ' + jwRes.statusCode))
                              }
                        })
                }));
            }

            //Wait for each async call and combine the results
            //Note this is making use of promises which aren't
            //supported in IE without a polyfill
            Promise.all(promises).then(function(results){
                console.log('Results :');
                console.log(JSON.stringify(results))

                //Now combine the results accordingly
                const hotelUserComments = results[0];
                const hotelUserRatings = results[1];

                //We're going to calc the average user rating here, could be moved inside template 
                //but not sure what best practice actually is..


                var averageRating;
                
                if(hotelUserRatings.length == 0){
                    averageRating = 0;
                }else{
                    averageRating = (hotelUserRatings.reduce(function(last,now){
                        return last.rating + now.rating;
                    }, 0) / hotelUserRatings.length );
                }

               
                var html = null;

                if(options.provider == 'Seatfilla'){
                    const hotelImages = results[2];
                    const hotelTags = results[3];

                    const template = $.templates('#seatfillaHotelTemplate');

                    html = template.render({
                        hotel:options.hotel,
                        hotelInfo:options.hotelInfo,
                        hotelUserComments,
                        hotelUserRatings,
                        hotelImages,
                        hotelTags,
                        averageRating
                    },{
                        numUsersWhoRated: function(num){
                            return hotelUserRatings.filter(
                                function(hotelUserRating){
                                return hotelUserRating.rating == num;
                            }).length;
                        },
                        normalizeImagePath: function(imgPath){
                            console.log(imgPath);
                            return imgPath.replace("Users/Dale/Desktop/capstonefinal/assets/", "");
                        }
                    }
                    );

                }else{

                    //Make request for hotel info...
                    const template = $.templates('#skyscannerHotelTemplate');

                    html = template.render({
                        hotel:options.hotel,
                        hotelInfo:options.hotelInfo,
                        hotelImages,
                        hotelTags
                    });
                }
                //member to delete local disk shit (causes errors)
                if(!html){
                    $('#templateContainer').html('Error rendering page');
                }else{
                    //Render our template.
                    $('#templateContainer').html(html);
                    attachEventListeners();
                }
            }).catch(function(err){
                console.log(err);
            })
        }

        populateData();

        function attachRealTimeListeners() {

            io.socket.on('hotel',function(hotel){
                console.log('hotel');
                console.log(hotel);
            })

            io.socket.on('hotelusercomment',function(hotelUserComment){
                console.log('hotelusercomment');
                console.log(hotelUserComment);
            })

            io.socket.on('hoteluserrating',function(hotelUserComment){
                console.log('hotelusercomment');
                console.log(hotelUserComment);
            })
        }
        attachRealTimeListeners();
        
    }
})(jQuery, io,window)