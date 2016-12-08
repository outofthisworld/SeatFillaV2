;(function ($, io, window) {

  // Check we have our dependencies
  if (!$)
    throw new Error('Jquery not defined')

  if (!$.templates)
    throw new Error('$.templates is not defined')

  if (!io)
    throw new Error('io not defined')

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

  var isInitialized = false

  /**
   * 
   * 
   * @param {any} options
   */
  window.seatfilla.globals.initHotelScript = function (options) {
    if (!options.id)
      throw new Error('Invalid script params ' + JSON.stringify(options))

    if (isInitialized) return
    isInitialized = true

    $('#templateContainer').css('background-image', 'url(https://images.trvl-media.com/media/content/expus/graphics/launch/home/tvly/150324_flights-hero-image_1330x742.jpg)')
    $.waitingDialog.show("Please wait, we're loading this hotel")

    /**
     * 
     */
    function attachEventHandlers () {
      console.log('Attaching handlers')

      const placeBidBtn = '#placeBid',
        postCommentBtn = '#postCooment',
        hotelReviewFormId = '#hotelReviewForm',
        bidAmountInput = '#bidAmount'

      $('#templateContainer').on('click', '#showBidModal', function () {
        const code = $('#seatfilla_currencies option:selected').val()
        const symbol = $('#seatfilla_currencies option:selected').attr('data-symbol')
        const saleId = $(this).attr('data-attr-hotelSaleId')
        const amt = $(bidAmountInput + saleId).val()
        $('#bidModalPrice').text([symbol, amt, code].join(' '))
      })

      $('#templateContainer').on('click', '#placeBid', function () {
        const hotelSale = $(this).attr('data-attr-hotelSaleId')
        if (!hotelSale) return

        const bidAmount = $(bidAmountInput + hotelSale).val()
        const currency = $('#seatfilla_currencies option:selected').val()

        console.log(bidAmount)
        console.log(currency)

        $.ajax({
          url: '/HotelSale/placeBid',
          data: {
            bidAmount,
            hotelSale,
          currency},
          method: 'POST',
          /**
           * 
           * 
           * @param {any} res
           * @param {any} ts
           * @param {any} xhr
           */
          success: function (res, ts, xhr) {
            if (xhr.status == 200 && res.status == 200) {
              $.toaster({ priority: 'info', message: 'Succesfully bidded on sale' })
            } else {
              $.toaster({ priority: 'warning', message: res.error || (res.errorMessage && res.errorMessages[0]) || 'Must be logged in' })
            }
          },
          /**
           * 
           * 
           * @param {any} xhr
           * @param {any} status
           * @param {any} error
           */
          error: function (xhr, status, error) {
            if (xhr.responseJSON.redirectUrl) {
              const base = window.location.href.replace('http://', '')
              window.location.href = xhr.responseJSON.redirectUrl + '&returnUrl=' + encodeURIComponent(base.slice(base.indexOf('/') + 1, window.location.href.length) + '&reload=true')
            }
            $.toaster({ priority: 'warning', message: xhr.responseJSON.error || (xhr.responseJSON.errorMessages && xhr.responseJSON.errorMessages[0]) })
          }
        })
      })

      $('#postComment').on('click', function () {
        $.ajax({
          data: {
            // Data for a hotel user comment
          },
          method: 'POST',
          url: '/hotel/' + options.hotel.id + '/HotelUserComment',
          /**
           * 
           * 
           * @param {any} res
           */
          success: function (res) {}
        })
      })

      $('#hotelReviewForm').submit(function (event) {
        // Prevent the form from submitting
        event.preventDefault()

        const rating = $('.btn-review-rating.btn-warning').length

        if (rating == 0) {
          $.toaster({
            priority: 'warning',
            message: 'Please submit a rating with your review'
          })
          return
        }

        console.log('sending review')

        const obj = $('#hotelReviewForm').serialize()
        obj.title = 'Hello world'

        $.ajax({
          data: obj,
          method: 'POST',
          url: '/hotel/' + options.hotel.id + '/HotelUserComments',
          /**
           * 
           * 
           * @param {any} res
           * @param {any} r
           * @param {any} xhr
           */
          success: function (res, r, xhr) {
            console.log('Recieved response after sending review : ' + res)
            if (xhr.status == 200) {
              $.toaster({
                priority: 'success',
                message: 'Succesfully submitted review'
              })
            } else {
              $.toaster({
                priority: 'warning',
                message: 'Failed to submit review'
              })
            }
          },
          /**
           * 
           * 
           * @param {any} XMLHttpRequest
           * @param {any} textStatus
           * @param {any} errorThrown
           */
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            $.toaster({
              priority: 'danger',
              message: 'Failed to submit review'
            })
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
          /**
           * 
           * 
           * @param {any} res
           * @param {any} r
           * @param {any} xhr
           */
          success: function (res, r, xhr) {
            console.log('submitting rating ' + res)
            if (xhr.status == 200) {
              $.toaster({
                priority: 'success',
                message: 'Succesfully submitted your rating'
              })
            } else {
              $.toaster({
                priority: 'warning',
                message: 'Failed to submit rating with review'
              })
            }
          },
          /**
           * 
           * 
           * @param {any} XMLHttpRequest
           * @param {any} textStatus
           * @param {any} errorThrown
           */
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            $.toaster({
              priority: 'danger',
              message: 'Failed to submit rating with review'
            })
            console.log(errorThrown)
          }
        })
      })

      $('.replyToComment').on('click', function () {
        const commentId = $(this).attr('data-attr-parentCommentId')
        $.ajax({
          data: {
            // Data for a comment 
          },
          method: 'POST',
          url: '/HotelUserComment/' + commentId + '/replies/',
          /**
           * 
           * 
           * @param {any} res
           */
          success: function (res) {}
        })
      })

      $('#yourRating').on('click', function () {
        $.ajax({
          data: {
            // Data for a hotel user rating
          },
          method: 'POST',
          url: '/hotel/' + options.hotel.id + '/HotelUserRating',
          /**
           * 
           * 
           * @param {any} res
           */
          success: function (res) {}
        })
      })

      $('.btn-review-rating').on('click', function () {
        $('.btn-review-rating').removeClass('btn-warning')
        const rating = $(this).attr('data-attr-rating')

        ;($('.btn-review-rating').get()).reverse().slice(5 - rating).forEach(
          function (ele) {
            $(ele).addClass('btn-warning')
          })
      })
    }

    function updateValueSlider (minBid, currency, id) {
      console.log('updating slider')
      console.log(arguments)
      window.seatfilla.globals.convertCurrency(minBid + 5, currency, $('#seatfilla_currencies option:selected').val(), function (err, minBid) {
        if (err || !minBid || !typeof minBid == 'number') {
          throw new Error('Error retrieving min bid ' + err)
        }

        minBid = Math.round(minBid)

        $('#slider' + id).slider({
          range: 'min',
          animate: true,
          value: minBid,
          min: minBid,
          max: 5000,
          step: 5,

          slide: function (event, ui) {
            update($(this), id, ui.value, minBid)
          }
        })

        /**
         * 
         * 
         * @param {any} slider
         * @param {any} id
         * @param {any} val
         * @param {any} min
         */
        function update (slider, id, val, min) {
          var $amount = val >= min ? val : min
          $('#bidAmount' + id).val($amount)
          $('#bidAmountLabel' + id).text($amount)
          $('#slider' + id + ' a').html('<label>' + $amount + '</label><div class="ui-slider-label-inner"></div>')
        }

        $('#bidAmount' + id).val(minBid)
        $('#bidAmountLabel' + id).text(minBid)
        $('#slider' + id + ' a').html('<label>' + minBid + '</label><div class="ui-slider-label-inner"></div>')
      })
    }

    /**
     * 
     */
    function populateData () {
      var sessionObject

      if (options.sessionObject) {
        try {
          sessionObject = JSON.parse(options.sessionObject)
        } catch (err) {
          console.log(err)
        }
        console.log(sessionObject)
      }

      // Hold the promises we need (combine the results of multiple async `get` requests)
      const promises = []
      const where = { hotel: options.id };
      ['/hotel/' + options.id + '?populate=' + JSON.stringify({
        hotelAmenities: { limit: 10 },
        hotelTags: { limit: 10 }
      }),
      // Limit to this check in and check out date
      '/HotelSale?where=' + JSON.stringify({ where}) + '&populate=' + JSON.stringify({
        bids: { sort: 'bidAmount DESC', limit: 5 },
        prices: { sort: 'price_total DESC', limit: 5 }
      }),
      '/HotelUserComment?where=' + JSON.stringify(where),
      '/HotelUserRating?where=' + JSON.stringify(where),
      '/HotelImage?where=' + JSON.stringify({
        hotel: options.id,
        width: { '>=': '600' },
        height: { '>=': '600' }
      })].forEach(function (path) {
        promises.push(new Promise(
          function (resolve, reject) {
            io.socket.get(path, function (res, jwRes) {
              if (jwRes.statusCode == 200) {
                return resolve(res)
              } else {
                return reject(new Error('Error retrieving result form path ' + path +
                  ' response status was ' + jwRes.statusCode))
              }
            })
          }))
      })

      // Wait for each async call and combine the results
      // Note this is making use of promises which aren't
      // supported in IE without a polyfill
      Promise.all(promises).then(function (results) {
        const hotel = results[0],
          hotelSales = results[1],
          hotelUserComments = results[2],
          hotelUserRatings = results[3],
          hotelImages = results[4]

        console.log('Hotel:')
        console.log(hotel)
        console.log('Hotel sales:')
        console.log(hotelSales)
        console.log('hotelUserRatings:')
        console.log(hotelUserRatings)
        console.log('hotelImages:')
        console.log(hotelImages)

        if (hotelSales.length < 1) {
          console.log('No hotel sales found')
          return
        }

        $(document).ready(function () {
          const template = $.templates('#hotelTemplate')
          /**
           * 
           * 
           * @param {any} hotelUserRating
           * @returns
           */
          /**
           * 
           * 
           * @param {any} last
           * @param {any} now
           * @returns
           */
          const html = template.render({
            hotel,
            hotelUserComments,
            hotelUserRatings,
            hotelImages,
          hotelSales}, {
            /**
             * 
             * 
             * @param {any} num
             * @returns
             */
            numUsersWhoRated: function (num) {
              return hotelUserRatings.filter(
                function (hotelUserRating) {
                  return hotelUserRating.rating == num
                }).length
            },
            /**
             * 
             * 
             * @returns
             */
            averageUserRating: function () {
              var averageRating
              if (hotelUserRatings.length == 0) {
                averageRating = 0
              } else {
                averageRating = ((hotelUserRatings.reduce(function (last, now) {
                    console.log(last)
                    return parseInt(last.rating || 0) + parseInt(now.rating || 0)
                  }, 0) / hotelUserRatings.length)) || 0
              }
              return averageRating
            },
            /**
             * 
             * 
             * @param {any} imgPath
             * @returns
             */
            normalizeImagePath: function (imgPath) {
              console.log(imgPath)
              return imgPath.replace('Users/Dale/Desktop/capstonefinal/assets/', '')
            },
            /**
             * 
             * 
             * @param {any} imgPath
             * @returns
             */
            httpImgPath: function (imgPath) {
              return 'http://' + imgPath
            },
            /**
             * 
             * 
             * @param {any} string
             * @returns
             */
            getAmenityIcon(string) {
              const icon = amenMapping[string]
              return (icon && icon.substring(1, icon.length)) || ''
            },
            /**
             * 
             * 
             * @param {any} date
             * @param {any} format
             * @returns
             */
            dateFormat(date, format) {
              return moment(date).format(format)
            }
          })

          $('#templateContainer').html('')
          $('#templateContainer').html(html)
          $('#seatfilla_currencies').trigger('change')

          attachEventHandlers()
          hotelSales.forEach(function (hotelSale, indx) {
            var time
            if (hotelSale.saleType == 'auction') {
              time = moment(hotelSale.checkInDate).subtract(1, 'days').toDate()
            } else {
              time = moment(hotelSale.checkInDate).toDate()
            }
            $('#clock' + hotelSale.id).countdown(time)
              .on('update.countdown', function (event) {
                var format = '%H:%M:%S'
                if (event.offset.totalDays > 0) {
                  format = '%-d day%!d ' + format
                }
                if (event.offset.weeks > 0) {
                  format = '%-w week%!w ' + format
                }
                $(this).html(event.strftime(format))
              })
              .on('finish.countdown', function (event) {
                $(this).html('This offer has expired!').parent().addClass('disabled')
                $('#hotelSale' + hotelSale.id).remove()
              })

            var minBid = 5
            var currency = 'USD'
            hotelSale.bids.forEach(function (bid) {
              if (bid.bidAmount > minBid) {
                minBid = bid.bidAmount
                currency = bid.currency || 'USD'
              }
            })

            updateValueSlider(minBid, currency, hotelSale.id)
            $('#seatfilla_currencies').on('change', function () {
              updateValueSlider(minBid, $('#seatfilla_currencies option:selected').val(), hotelSale.id)
            })
          })

   

          ;(function createGoogleMap () {
            var latLng = {
              lat: parseInt(hotel.longitude || 0),
              lng: parseInt(hotel.latitude || 0)
            }

            var map = new google.maps.Map(document.getElementById('map'), {
              zoom: 4,
              center: latLng
            })

            var infowindow = new google.maps.InfoWindow({
              content: hotel.hotelName + ' position: (lat:' + hotel.latitude + ', lng' + hotel.longitude + ')'
            })
            var marker = new google.maps.Marker({
              position: latLng,
              map: map,
              title: 'Hotel location'
            })
            infowindow.open(map, marker)

            window.seatfilla.globals.geolocation.getUserLocation(function (status, location) {
              if (status == 200 && location) {
                const uLoc = {
                  lat: location.coords.latitude,
                  lng: location.coords.longitude
                }
                var marker2 = new google.maps.Marker({
                  position: uLoc,
                  map: map,
                  title: 'Your location'
                })
                var infowindow2 = new google.maps.InfoWindow({
                  content: 'Your position: (lat:' + uLoc.lat + ', lng' + uLoc.lng + ')'
                })

                infowindow2.open(map, marker2)
              }
            })
          })()
          
          ;(function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0]
            if (d.getElementById(id)) return
            js = d.createElement(s); js.id = id
            js.src = '//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8&appId=294356564254458'
            fjs.parentNode.insertBefore(js, fjs)
          }(document, 'script', 'facebook-jssdk'))

          
          ;(function ($) {
            /**
             * 
             * 
             * @param {any} elems
             */
            function doAnimations (elems) {
              // Cache the animationend event in a variable
              var animEndEv = 'webkitAnimationEnd animationend'

              elems.each(function () {
                var $this = $(this),
                  $animationType = $this.data('animation')
                $this.addClass($animationType).one(animEndEv, function () {
                  $this.removeClass($animationType)
                })
              })
            }

            var $myCarousel = $('#carousel-example-generic'),
              $firstAnimatingElems = $myCarousel.find('.item:first').find("[data-animation ^= 'animated']")

            $myCarousel.carousel()

            doAnimations($firstAnimatingElems)

            $myCarousel.carousel('pause')

            $myCarousel.on('slide.bs.carousel', function (e) {
              var $animatingElems = $(e.relatedTarget).find("[data-animation ^= 'animated']")
              doAnimations($animatingElems)
            })
            $('#carousel-example-generic').carousel({
              interval: 3000,
              pause: 'false'
            })
          })(jQuery)

          $('#templateContainer').css('background-image', 'none')
          $.waitingDialog.hide()
        })
      }).catch(function (err) {
        console.log(err)
      })
    }
    populateData()

    /**
     * 
     */
    function attachRealTimeListeners () {
      io.socket.on('hotel', function (hotel) {
        console.log('hotel')
        console.log(hotel)
      })

      io.socket.on('hotelusercomment', function (hotelUserComment) {
        console.log('hotelusercomment')
        console.log(hotelUserComment)
      })

      io.socket.on('hotelsale', function (hotelSale) {
        console.log('Hotel sale event: ')
        console.log(hotelSale)
        const events = {
          /**
           * 
           * 
           * @param {any} hotelSale
           */
          create: function () {},
          /**
           * 
           * 
           * @param {any} hotelSale
           */
          update: function () {},
          /**
           * 
           * 
           * @param {any} hotelSale
           */
          destroy: function () {},
          /**
           * 
           * 
           * @param {any} hotelSale
           */
          addedTo: function () {
            console.log('added to')

            const addedEvents = {
              bids: function () {
                if (hotelSale.added) {
                  const $hotelSaleBids = $('.hotelBids[data-attr-hotelSaleId="' + hotelSale.id + '"]')
                  if (!$hotelSaleBids) {
                    console.log('Error finding hotel sale bids')
                    return
                  }

                  const temp = $.templates('#hotelBidTemplate')
                  const html = temp.render(hotelSale.added)
                  console.log('rendering html')
                  $hotelSaleBids.prepend(html)
                  $('#seatfilla_currencies').trigger('change')
                  console.log('triggering slider update')
                  updateValueSlider(hotelSale.added.bidAmount, hotelSale.added.currency, hotelSale.id)
                }
              }
            }

            if (hotelSale.attribute in addedEvents) {
              addedEvents[hotelSale.attribute].call()
            }else {
              console.log(hotelSale.attribute + ' event not supported')
            }
          },
          /**
           * 
           * 
           * @param {any} hotelSale
           */
          removedFrom: function () {
            ({

            })[hotelSale.attribute]
          }
        }

        if (hotelSale.verb in events) {
          events[hotelSale.verb].call()
        }else {
          console.log('Verb : ' + hotelSale.verb + ' not supported')
        }
      })
    }
    attachRealTimeListeners()
  }
})(jQuery, io, window)
