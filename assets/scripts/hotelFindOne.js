/*

Initializes the hotel script

*/
(function($, io, window) {

    //Check we have our dependencies
    if (!$)
        throw new Error('Jquery not defined');

    if (!$.templates)
        throw new Error('$.templates is not defined');

    if (!io)
        throw new Error('io not defined');


    var waitingDialog = waitingDialog || (function ($) {
 
	var $dialog = $(
		'<div class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">' +
		'<div class="modal-dialog modal-m">' +
		'<div class="modal-content">' +
			'<div class="modal-header"><h3 style="margin:0;"></h3></div>' +
			'<div class="modal-body">' +
				'<div class="progress progress-striped active" style="margin-bottom:0;"><div class="progress-bar" style="width: 100%"></div></div>' +
			'</div>' +
		'</div></div></div>');

        return {
            show: function (message, options) {
                // Assigning defaults
                if (typeof options === 'undefined') {
                    options = {};
                }
                if (typeof message === 'undefined') {
                    message = 'Loading';
                }
                var settings = $.extend({
                    dialogSize: 'm',
                    progressType: '',
                    onHide: null // This callback runs after the dialog was hidden
                }, options);

                // Configuring dialog
                $dialog.find('.modal-dialog').attr('class', 'modal-dialog').addClass('modal-' + settings.dialogSize);
                $dialog.find('.progress-bar').attr('class', 'progress-bar');
                if (settings.progressType) {
                    $dialog.find('.progress-bar').addClass('progress-bar-' + settings.progressType);
                }
                $dialog.find('h3').text(message);
                // Adding callbacks
                if (typeof settings.onHide === 'function') {
                    $dialog.off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
                        settings.onHide.call($dialog);
                    });
                }
                // Opening dialog
                $dialog.modal();
            },
            /**
             * Closes dialog
             */
            hide: function () {
                $dialog.modal('hide');
            }
        };

    })($);



    var isInitialized = false;

    //Here we define our hotel script
    window.seatfilla.globals.initHotelScript = function(options) {

        if (!options.id || !options.hotel || !options.hotelInfo || !options.provider)
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

                $("#hotelReviewForm").submit(function(event) {
                    //Prevent the form from submitting
                    event.preventDefault();

                    const rating = $('.btn-review-rating.btn-warning').length;

                    if (rating == 0) {
                        $.toaster({
                            priority: 'warning',
                            message: 'Please submit a rating with your review'
                        });
                        return;
                    }

                    console.log('sending review')

                    const obj = $('#hotelReviewForm').serialize();
                    obj.title = 'Hello world';

                    $.ajax({
                        data: obj,
                        method: 'POST',
                        url: '/hotel/' + options.hotel.id + '/HotelUserComments',
                        success: function(res, r, xhr) {
                            console.log('Recieved response after sending review : ' + res);
                            if (xhr.status == 200) {
                                $.toaster({
                                    priority: 'success',
                                    message: 'Succesfully submitted review'
                                });
                            } else {
                                $.toaster({
                                    priority: 'warning',
                                    message: 'Failed to submit review'
                                });
                            }
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            $.toaster({
                                priority: 'danger',
                                message: 'Failed to submit review'
                            });
                            console.log(errorThrown)
                        }
                    })

                    $.ajax({
                        data: {
                            rating,
                            hotel: options.hotel.id
                        },
                        method: 'POST',
                        url: '/hotel/' + options.hotel.id + '/HotelUserRating',
                        success: function(res, r, xhr) {
                            console.log('submitting rating ' + res)
                            if (xhr.status == 200) {
                                $.toaster({
                                    priority: 'success',
                                    message: 'Succesfully submitted your rating'
                                });
                            } else {
                                $.toaster({
                                    priority: 'warning',
                                    message: 'Failed to submit rating with review'
                                });
                            }
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            $.toaster({
                                priority: 'danger',
                                message: 'Failed to submit rating with review'
                            });
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

                $('.btn-review-rating').on('click', function() {
                    $('.btn-review-rating').removeClass('btn-warning');
                    const rating = $(this).attr('data-attr-rating');

                    ($('.btn-review-rating').get()).reverse().slice(5 - rating).forEach(
                        function(ele) {
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

        function initializePage(options) {
            (function createGoogleMap() {

                var latLng = {
                    lat: parseInt(options.latitude || 0),
                    lng: parseInt(options.longitude || 0)
                };

                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 4,
                    center: latLng
                });

                var marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    title: 'Hotel location'
                });

                window.seatfilla.globals.geolocation.getUserLocation(function(status, location) {
                    if (status == 200 && location) {
                        const uLoc = {
                            lat: location.coords.latitude,
                            lng: location.coords.longitude
                        };
                        var marker = new google.maps.Marker({
                            position: uLoc,
                            map: map,
                            title: 'Your location'
                        });
                        if (options.centerOnUser)
                            map.setCenter(uLoc);
                    } else {
                        console.log('Could not retrieve user location for map')
                    }
                })


            })();
        }

        function populateData() {

            const where = {
                hotel: options.id
            };

            const hotelInfoWhere = {
                hotelInfo: options.hotelInfo.id
            };

            console.log(hotelInfoWhere);

            //Hold the promises we need (combine the results of multiple async `get` requests)
            const promises = [];

            promises.push(new Promise(
                function(resolve, reject) {
                    io.socket.get('/HotelUserComment?where=' + JSON.stringify(where), function(res, jwRes) {
                        if (jwRes.statusCode == 200) {
                            return resolve(res);
                        } else {
                            return reject(new Error('Error retrieving hotel user comment,' +
                                ' response status was ' + jwRes.statusCode))
                        }
                    })
                }));

            promises.push(new Promise(
                function(resolve, reject) {
                    io.socket.get('/HotelUserRating?where=' + JSON.stringify(where), function(res, jwRes) {
                        if (jwRes.statusCode == 200) {
                            return resolve(res);
                        } else {
                            return reject(new Error('Error retrieving hotel user rating,' +
                                ' response status was ' + jwRes.statusCode))
                        }
                    })
                }));

            if (options.provider == 'Seatfilla') {

                promises.push(new Promise(
                    function(resolve, reject) {
                        io.socket.get('/HotelImage?where=' + JSON.stringify(hotelInfoWhere), function(res, jwRes) {
                            if (jwRes.statusCode == 200) {
                                return resolve(res);
                            } else {
                                return reject(new Error('Error retrieving hotel images,' +
                                    ' response status was ' + jwRes.statusCode))
                            }
                        })
                    }));

                promises.push(new Promise(
                    function(resolve, reject) {
                        io.socket.get('/HotelTag?where=' + JSON.stringify(hotelInfoWhere), function(res, jwRes) {
                            if (jwRes.statusCode == 200) {
                                return resolve(res);
                            } else {
                                return reject(new Error('Error retrieving hotel tags,' +
                                    ' response status was ' + jwRes.statusCode))
                            }
                        })
                    }));
            }

            //Wait for each async call and combine the results
            //Note this is making use of promises which aren't
            //supported in IE without a polyfill
            Promise.all(promises).then(function(results) {
                console.log('Results :');
                console.log(JSON.stringify(results))

                //Now combine the results accordingly
                const hotelUserComments = results[0];
                const hotelUserRatings = results[1];

                //We're going to calc the average user rating here, could be moved inside template 
                //but not sure what best practice actually is..

                //Make this into a view helper
                var averageRating;
                if (hotelUserRatings.length == 0) {
                    averageRating = 0;
                } else {
                    averageRating = ((hotelUserRatings.reduce(function(last, now) {
                        console.log(last)
                        return parseInt(last.rating || 0) + parseInt(now.rating || 0);
                    }, 0) / hotelUserRatings.length)) || 0;
                }

                const viewHelpers = {
                    numUsersWhoRated: function(num) {
                        return hotelUserRatings.filter(
                            function(hotelUserRating) {
                                return hotelUserRating.rating == num;
                            }).length;
                    },
                    normalizeImagePath: function(imgPath) {
                        console.log(imgPath);
                        return imgPath.replace("Users/Dale/Desktop/capstonefinal/assets/", "");
                    },
                    httpImgPath: function(imgPath) {
                        return 'http://' + imgPath;
                    }
                }

                function renderPage(html) {
                    if (!html) {
                        $('#templateContainer').html('Error rendering page');
                    } else {
                        //Render our template.
                        $('#templateContainer').html(html);
                        attachEventListeners();
                        initializePage({
                            longitude: (options.hotelInfo && options.hotelInfo.longitude) || options.hotel.longitude,
                            latitude: (options.hotelInfo && options.hotelInfo.longitude) || options.hotel.latitude,
                        });
                    }
                }

                if (options.provider == 'Seatfilla') {
                    const hotelImages = results[2];
                    const hotelTags = results[3];

                    const template = $.templates('#seatfillaHotelTemplate');
                    waitingDialog.hide();
                    renderPage(template.render({
                            hotel: options.hotel,
                            hotelInfo: options.hotelInfo,
                            hotelUserComments,
                            hotelUserRatings,
                            hotelImages,
                            hotelTags,
                            averageRating
                        },
                        viewHelpers));
                } else {
                    //Make request for hotel info...
                    const template = $.templates('#skyscannerHotelTemplate');
                    const detailsUrl = options.hotel.detailsUrl;

                    function pollDetails(detailsUrl) {
                        $.ajax({
                            url: '/hotel/hotelDetails',
                            method: 'POST',
                            data: {
                                detailsUrl,
                                hotelIds: [options.id]
                            },
                            success: function(result, r, xhr) {
                                if (result && xhr.status == 200) {

                                    if (result.body.status == "COMPLETE") {
                                        console.log('Final result after poll was:');
                                        console.log(result);
                                        waitingDialog.hide();
                                        renderPage(template.render({
                                                hotel: options.hotel,
                                                hotelInfo: result.body,
                                                hotelUserRatings,
                                                hotelUserComments,
                                                averageRating
                                            },
                                            viewHelpers))
                                    } else {
                                        pollDetails(result.nextPollUrl)
                                    }

                                } else {
                                    alert('Error getting hotel details');
                                    console.log('Status: ' + xhr.status);
                                    console.log('Result ' + result)
                                }
                            }
                        })
                    }
                    pollDetails(detailsUrl);
                }
                //member to delete local disk shit (causes errors)
            }).catch(function(err) {
                console.log(err);
            })
        } 
    
        waitingDialog.show('Loading hotel.. ' + options.hotel.name ||
         (options.hotelInfo && options.hotelInfo.hotelName));
        populateData();

        function attachRealTimeListeners() {

            io.socket.on('hotel', function(hotel) {
                console.log('hotel');
                console.log(hotel);
            })

            io.socket.on('hotelusercomment', function(hotelUserComment) {
                console.log('hotelusercomment');
                console.log(hotelUserComment);
            })

            io.socket.on('hoteluserrating', function(hotelUserRating) {
                console.log('hotel user rating: ' + hotelUserRating)

                const checkValid = function() {
                    return hotelUserRating.hotel.id == options.hotelInfo.id;
                }

                ((function(verb) {
                    return {
                        create: function(hotelUserRating) {
                            //Model.watch(req) called when performing get
                            //this means that this will be called for all
                            //created hotelUserRatings (so check to see hotelUserRating.hotel == options.hotel.id)
                            if (checkValid()) {

                            } else {

                            }

                        },
                        update: function(hotelUserRating) {
                            //A hotel tag has been updated (from subsribed)
                            if (checkValid()) {

                            } else {

                            }
                        },
                        destroy: function(hotelUserRating) {
                            //A hotel tag has been destroyed  (from subsribed)
                            if (checkValid()) {

                            } else {

                            }
                        },
                        add: function(hotelUserRating) {
                            //Somethings been added to a hotelUserRating  (from subsribed)
                            if (checkValid()) {

                            } else {

                            }
                        },
                        remove: function(hotelUserRating) {
                            //Somethings been removed from a hotelUserRating  (from subsribed)
                            if (checkValid()) {

                            } else {

                            }
                        }
                    }[verb]
                })(hotelUserRating.verb))(hotelUserRating)
            })

            io.socket.on('hoteltag', function(hotelTag) {
                console.log('hotelTag: ' + hotelTag);

                const checkValid = function() {
                    return hotelTag.hotelInfo.id == options.hotelInfo.id;
                }

                ((function(verb) {
                    return {
                        create: function(hotelTag) {
                            //Model.watch(req) called when performing get
                            //this means that this will be called for all
                            //created hotelTags (so check to see hotelTag.hotel == options.hotel.id)
                            if (checkValid()) {

                            } else {

                            }

                        },
                        update: function(hotelTag) {
                            //A hotel tag has been updated (from subsribed)
                            if (checkValid()) {

                            } else {

                            }
                        },
                        destroy: function(hotelTag) {
                            //A hotel tag has been destroyed  (from subsribed)
                            if (checkValid()) {

                            } else {

                            }
                        },
                        add: function(hotelTag) {
                            //Somethings been added to a hotelTag  (from subsribed)
                            if (checkValid()) {

                            } else {

                            }
                        },
                        remove: function(hotelTag) {
                            //Somethings been removed from a hotelTag  (from subsribed)
                            if (checkValid()) {

                            } else {

                            }
                        }
                    }[verb]
                })(hotelTag.verb))(hotelTag)
            })

            io.socket.on('hotelimage', function(hotelImage) {

            })
        }
        attachRealTimeListeners();

    }
})(jQuery, io, window)