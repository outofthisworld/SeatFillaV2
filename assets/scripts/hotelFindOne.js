
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


      const amenMapping = {
      'LAUNDRY': '.icon-laundry',
      'WIFISERVICE': '.icon-wifi',
      'FIREPLACE': '.icon-fireplace',
      'LUGGAGESTORAGE': '.icon-suitcase',
      'GARDEN': '.icon-garden',
      'FIREEXTINGUISHER': '.icon-fire-extinguisher',
      'BED': '.icon-bed',
      'TAXI': '.icon-taxi',
      'BALCONY': '.icon-terrace',
      'TOILETPAPER': '.icon-toilet-paper',
      'TOOTHPASTE': '.icon-toothbrush-toothpaste',
      'TOOTHBURSH': '.icon-toothbrush-toothpaste',
      'GYMNASIUM': '.icon-gym-equipment',
      'PS4': '.icon-game-console',
      'PS3': '.icon-game-console',
      'PS2': '.icon-game-console',
      'XBOX': '.icon-game-console',
      'PHONE': '.icon-phone',
      'BABYSITTINGSERVICE': '.icon-child-care',
      'CHILDREN': '.icon-child-care',
      'KIDS': '.icon-child-care',
      'ADOLESCENTS': '.icon-child-care',
      'PHONESERVICE': '.icon-phone',
      'ROOMSERVICE': '.icon-phone-service',
      'XBOX 360': '.icon-game-console',
      'XBOX-360': '.icon-game-console',
      'GAMECONSOLE': '.icon-game-console',
      'NINTENDO': '.icon-game-console',
      'NINTENDO WII': '.icon-game-console',
      'WII': '.icon-game-console',
      'PRIVATEBEACH': '.icon-beach',
      'MEETINGROOM': '.icon-meeting-table',
      'BATH': '.icon-bath',
      'BUNKBED': '.icon-bunk-beds',
      'BUNKBEDS': '.icon-bunk-beds',
      'SHOWER': '.icon-shower',
      'LAMP': '.icon-lamp',
      'LIGHTING': '.icon-lamp',
      'BICYCLE': '.icon-bicycle',
      'ATM': '.icon-atm',
      'BLENDER': '.icon-blender',
      'CLOCK': '.icon-clock',
      'WALLCLOCK': '.icon-clock',
      'ALARMCLOCK': '.icon-clock',
      'STORE': '.icon-store',
      'ANIMAL': '.icon-animal',
      'ANIMALS': '.icon-animal',
      'PETSALLOWEDSERVICE': '.icon-animals',
      'FITNESSCENTER': '.icon-dumbbell',
      'CAMERA': '.icon-camera',
      'YOGA': '.flaticon-yoga-mat',
      'DISABLED': '.icon-wheel-chair',
      'WHEELCHAIR': '.icon-wheel-chair',
      'BUSINESSCENTER': '.icon-meeting',
      'FRONTDESK24HSERVICE': '.icon-reception',
      'GYMNASIUM': '.icon-gym-equipment',
      'DISABLEDFACILITY': '.icon-wheel-chair',
      'LIMOUSINESERVICE': '.icon-taxi',
      'FIRSTAID': '.icon-first-aid',
      'HEATING': '.icon-heater',
      'HORSE': '.icon-horse',
      'TOWEL': '.icon-towel',
      'OVEN': '.icon-oven',
      'SCALES': 'icon-scales',
      'LOCK': '.icon-lock',
      'PADLOCK': '.icon-lock',
      'COOKTOP': '.icon-oven',
      'BICYCLE': '.icon-bicycle',
      'COOKING': '.icon-oven',
      'MASSAGE': '.icon-massage',
      'MINIBAR': '.icon-bar-fridge',
      'MINI-BAR': '.icon-bar-fridge',
      'MINIBARSERVICE': '.icon-bar-fridge',
      'DESK': '.icon-desk',
      'LIFT': '.icon-lift',
      'ELEVATOR': '.icon-lift',
      'SHAMPOO': '.icon-shampoo',
      'MIRROR': '.icon-mirror',
      'AIRCONDITIONER': '.icon-air-conditioner',
      'AIRCONDITIONING': '.icon-air-conditioner',
      'HEATER': '.icon-heater',
      'FRIDGE': '.icon-refrigerator',
      'REFRIGERATOR': '.icon-refrigerator',
      'MICROWAVE': '.icon-microwave',
      'NEWSPAPER': '.icon-newspaper',
      'HAIRDRYER': '.icon-hairdryer',
      'IRON': '.icon-iron',
      'LAPTOP': '.icon-computer',
      'COMPUTER': '.icon-computer',
      'COFEEMAKER': '.icon-coffee-machine',
      'COFEE': '.icon-coffee',
      'INDOORSWIMMINGPOOL': '.icon-outdoor-pool',
      'INDOORPOOL': '.icon-outdoor-pool',
      'CHILDRENPOOL': '.icon-outdoor-pool-sunumbrella',
      'CHILDRENSWIMMINGPOOL': '.icon-outdoor-pool-subumbrella',
      'BUSINESSCENTER': '.icon-meeting',
      'CONFERENCEFACILITIES': 'icon-meeting',
      'CONFERENCEFACILITY': 'icon-meeting',
      'BREAKFAST': '.icon-eating-utensils',
      'RESTAURANT': '.icon-restaurant',
      'TENNISCOURT': '.icon-tennis-court',
      'RADIO': '',
      'STEAMROOM': '',
      'FAX': '',
      'PHOTOCOPIER': '',
      'PHOTOCOPYINGSERVICE': '',
      'BEAUTYSALON': '',
      'RADIOSERVICE': '',
      'RADIO': '',
      'CURRENCYEXCHANGE': '',
      'CURRENCYEXCHANGESERVICE': '',
      'WAKEUPCALL': '',
      'WAKEUPCALLSERVICE': '',
      'LOUNGE': '.icon-couch',
      'BIN': '.icon-bin',
      'BARFRIDGE': '.icon-bar-fridge',
      'BARREFRIDGERATOR': '.icon-bar-fridge',
      'TV': '.icon-television-flatscreen',
      'DVD': '.icon-dvd',
      'TELEPHONE': '.icon-phone',
      'EXPRESSCHECKOUT': '.icon-credit-card',
      'EXPRESSCHECKOUTSERVICE': '.icon-credit-card',
      'CONFERENCEFACILITIES': '.icon-meeting',
      'MULTILINGUALSTAFFSERVICE': '.icon-doorman',
      'MULTILINGUALSTAFF': '.icon-doorman',
      'RECEPTIONAREA': '.icon-reception',
      'TELEVISION': '.icon-television-flatscreen',
      'DAILYNEWSPAPERSERVICE': '.icon-newspaper',
      'PINGPONG': '.icon-ping-pong',
      'PING-PONG': '.icon-ping-pong',
      'PING PONG': '.icon-ping-pong',
      'FITNESSCENTRE': '.icon-dumbbell',
      'SMOKINGAREA': '.icon-smoking',
      'BABYSITTINGSERVICE': '.icon-child-care',
      'SUNUMBRELLA': '.icon-sun-umbrella',
      'NONSMOKINGSERVICE': '.icon-no-smoking',
      'BAR': '.icon-beer',
      'GOLF': '.icon-golf-club',
      'GOLFCOURSE': '.icon-golf-club',
      'GOLF-COURSE': '.icon-golf-club',
      'SATTELITETV': '.icon-television-antenna',
      'DOORMAN': '.icon-door-man',
      'SAUNA': '',
      'PARKING': '.icon-parking',
      'MARINA': '.icon-marina',
      'SHOP': '.icon-shop',
      'EXPRESSCHECKINSERVICE': '.icon-credit-card',
      'CONCIERGESERVICE': '.icon-doorman',
      'DOORMAN': '.icon-doorman',
      'OUTDOORSWIMMINGPOOL': '.icon-outdoor-swimming-pool',
      'SPA': '.icon-spa',
      'ROOMSERVICE': '.icon-room-service',
      'MASSAGE': '.icon-massage',
      'MASSAGESERVICE': '.icon-massage',
      'INTERNETACCESSSERVICE': '.icon-wifi',
      'SAFEDEPOSITBOX': '.icon-safe',
      'FIRSTAID': '.icon-first-aid',
      'FIRSTAIDKIT': '.icon-first-aid',
      'LUGGAGECART': '.icon-luggage-trolley',
      'LUGGAGETROLLEY': '.icon-luggage-troller',
      'LIFEGUARD': '.icon-life-guard',
      'CONSIERGE': '.icon-reception',
      'CONSIERGESERVICE': '.icon-reception',
      'BEACH': '.icon-beach',
      'SMOKINGAREA': '.icon-smoking'
  }


    var isInitialized = false;

    //Here we define our hotel script
    window.seatfilla.globals.initHotelScript = function(options) {

        if (!options.id || !options.resSendTime)
            throw new Error('Invalid script params ' + JSON.stringify(options));

      

        if (isInitialized) return;

        //Store intialized state
        isInitialized = true;


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

          
                    $('#myCarousel').carousel({
                        interval: 10000
                    })

                    $('.fdi-Carousel .item').each(function () {
                        var next = $(this).next();
                        if (!next.length) {
                            next = $(this).siblings(':first');
                        }
                        next.children(':first-child').clone().appendTo($(this));

                        if (next.next().length > 0) {
                            next.next().children(':first-child').clone().appendTo($(this));
                        }
                        else {
                            $(this).siblings(':first').children(':first-child').clone().appendTo($(this));
                        }
                    });
         
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
            const where = { hotel: options.id};

            //Hold the promises we need (combine the results of multiple async `get` requests)
            const promises = [];

            [
              '/hotel/' + options.id + '?populate=hotelAmenities,hotelTags',
              '/HotelSale?where='+JSON.stringify(where)+'&populate=prices,bids',
              '/HotelUserComment?where=' + JSON.stringify(where),
              '/HotelUserRating?where=' + JSON.stringify(where),
              '/HotelImage?where=' + JSON.stringify(where)
            ].forEach(function(path){
                promises.push(new Promise(
                function(resolve, reject) {
                    io.socket.get(path, function(res, jwRes) {
                        if (jwRes.statusCode == 200) {
                            return resolve(res);
                        } else {
                            return reject(new Error('Error retrieving result' +
                                ' response status was ' + jwRes.statusCode))
                        }
                    })
                }));
            })

            //Wait for each async call and combine the results
            //Note this is making use of promises which aren't
            //supported in IE without a polyfill
            Promise.all(promises).then(function(results) {
                console.log('Results :');
                const hotel = results[0],
                      hotelSales = results[1],
                      hotelUserComments = results[2],
                      hotelUserRatings = results[3],
                      hotelImages = results[4];

                console.log('Hotel:');
                console.log(hotel);
                console.log('Hotel sales:');
                console.log(hotelSales);
                console.log('hotelUserRatings:');
                console.log(hotelUserRatings);
                console.log('hotelImages:');
                console.log(hotelImages);

                var auctionEndTime = moment(hotelSales[0].checkInDate);
                console.log('auction end time:')
                console.log(auctionEndTime)
                console.log('currentTime: ')
                console.log(moment())
                var secondsLeft =  auctionEndTime.diff(moment(),'seconds');
                console.log(secondsLeft)
                setInterval(function(){
                  var sLeft = secondsLeft%60;
                  var mLeft = (secondsLeft/60)%60;	
                  var hours = secondsLeft/60/60;

                  console.log(hours + ':' + mLeft + ':' + sLeft);
                  secondsLeft-=1;
                },1000)

                
               /* //Now combine the results accordingly
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
                    },
                    getAmenityIcon(string) {
                        const icon = amenMapping[string];
                        return (icon && icon.substring(1, icon.length)) || '';
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
                    $.waitingDialog.hide();
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
                                        $.waitingDialog.hide();

                                        viewHelpers.getAgentDetails = function(id){
                                            return result.body.agents.find(function(agent){
                                                return agent.id == id;
                                            })
                                        }

                                        renderPage(template.render({
                                                hotel:options.hotel,
                                                extendedHotelInfo:result.body.hotels[0],                                              
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
            }).catch(function(err) {
                console.log(err);
            }*/
        });
        }
    
        $.waitingDialog.show('Please wait, we\'re loading this hotel');
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