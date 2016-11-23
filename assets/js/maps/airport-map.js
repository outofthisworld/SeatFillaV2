/*
    Logic for the airport map.
    Created by Dale.
*/

$(document).ready(function() {
    (function initMap(options) {
        var sf_map = _seat_filla_map({
            enableHighAccuracy: true,
            timeout: 6000,
            maximumAge: 0,
            desiredAccuracy: 30,
            fallbackToIP: true,
            addressLookup: true,
            timezone: true,
            useCache: true,
            preFetchLocation: true,
            maxOpenMarkers: 1
        })

        /* Populate the text boxes */
        $('#departure_city').val(sf_map.location.address.region)
        $('#departure_country').val(sf_map.location.address.country)
        $('#location').text(sf_map.location.formattedAddress)
        $('#country_flag').attr('src', sf_map.location.flag)

        const airportData = options.airportData
        var numPolls = 0

        var line

        // SVG path for a plane
        const planeSymbol = {
            path: 'M362.985,430.724l-10.248,51.234l62.332,57.969l-3.293,26.145 l-71.345-23.599l-2.001,13.069l-2.057-13.529l-71.278,22.928l-5.762-23.984l64.097-59.271l-8.913-51.359l0.858-114.43 l-21.945-11.338l-189.358,88.76l-1.18-32.262l213.344-180.08l0.875-107.436l7.973-32.005l7.642-12.054l7.377-3.958l9.238,3.65 l6.367,14.925l7.369,30.363v106.375l211.592,182.082l-1.496,32.247l-188.479-90.61l-21.616,10.087l-0.094,115.684',
            scale: 0.0493,
            strokeOpacity: 1,
            strokeColor: '#G2F',
            strokeWeight: 1,
            anchor: new google.maps.Point(300, 300)
        }

        const icons = {
            airport: {
                url: 'http://127.0.0.1:1337/images/g_maps_airport_icon.png',
                // This marker is 20 pixels wide by 32 pixels high.
                size: new google.maps.Size(32, 32),
                // The origin for this image is (0, 0).
                origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the airport icon at (0, 32).
                anchor: new google.maps.Point(32 / 2, 32)
            },
            hotel: {
                url: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Map_marker_icon_%E2%80%93_Nicolas_Mollet_%E2%80%93_Hotel_%E2%80%93_Restaurants_%26_Hotels_%E2%80%93_Dark.png',
                // This marker is 20 pixels wide by 32 pixels high.
                size: new google.maps.Size(32, 32),
                // The origin for this image is (0, 0).
                origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the airport icon at (0, 32).
                anchor: new google.maps.Point(32 / 2, 32)
            }
        }

        var from = {
            latitude: sf_map.location.coords.latitude,
            longitude: sf_map.location.coords.longitude,
            lat: sf_map.location.coords.latitude,
            lng: sf_map.location.coords.longitude
        }

        const airportMarker = {
            title: 'Some title',
            map: sf_map.map,
            animation: google.maps.Animation.DROP,
            markerClickAnimation: google.maps.Animation.BOUNCE,
            draggable: false,
            icon: icons.airport,
            onClickListeners: {
                mapListeners: [],
                markerListeners: [
                    function onMarkerClicked(event) {
                        var to = {
                            latitude: event.latLng.lat(),
                            longitude: event.latLng.lng(),
                            lat: event.latLng.lat(),
                            lng: event.latLng.lng()
                        }
                        var result = geolocator.calcDistance({
                            from,
                            to
                        })

                        if (line) line.setMap(null)

                        line = sf_map.createAnimatedLineSymbol({
                            path: [from, to],
                            icons: [{
                                icon: planeSymbol,
                                offset: '0%',
                                repeat: '100px'
                            }],
                            strokeOpacity: 0.5,
                            strokeColor: '#FFF'
                        })
                    },
                    function updateSelection(event) {
                        _marker = this
                            /* Get the longitude and latitude of the airport */
                        const pos = {
                            lng: _marker.data.Longitude,
                            lat: _marker.data.Latitude
                        }

                        /* Get the longitude and latitude */
                        const jsonPos = JSON.stringify(pos)

                        $("#destination_airports option[value='" + jsonPos + "']").attr('selected', true)
                    }
                ]
            },
            content: '<h1>Its an airport!</h1>'
        }

        const hotelMarker = {
            title: 'Hotel',
            map: sf_map.map,
            animation: google.maps.Animation.DROP,
            markerClickAnimation: google.maps.Animation.BOUNCE,
            draggable: false,
            icon: icons.hotel,
            onClickListeners: {
                mapListeners: [],
                markerListeners: [
                    function onMarkerClicked(event) {
                        var to = {
                            latitude: event.latLng.lat(),
                            longitude: event.latLng.lng(),
                            lat: event.latLng.lat(),
                            lng: event.latLng.lng()
                        }
                        var result = geolocator.calcDistance({
                            from,
                            to
                        })

                        if (line) line.setMap(null)
                    },
                    function updateSelection(event) {
                        _marker = this
                    }
                ]
            },
            content: '<h1>Its an airport!</h1>'
        }

        function populateHotelData(response, x, xhr) {
            if (xhr.status != 200) {
                alert('error')
                console.log(response)
            } else {
                $('#notification').attr('opened', 'true').attr('text', 'We have managed to locate some hotels in the area you will be landing! Browse for the perfect hotel, or skip this step.')

                $('#MyModal').modal('toggle')
                const result = response.result
                console.log(result)
                result.hotels.forEach(function(hotel) {
                    const hotelName = hotel.name
                    const hotelPopularity = hotel.popularity
                    const distanceFromSearch = hotel.distance_from_search
                    const longitude = hotel.longitude
                    const latitude = hotel.latitude
                    const popularityDesc = hotel.popularity_desc
                    const star_rating = hotel.star_rating
                    const image_host_url = result.image_host_url
                    var image_urls = []

                    for (var i in hotel.images) {
                        if (hotel.images.hasOwnProperty(i)) {
                            for (var j in hotel.images[i]) {
                                if (j.endsWith('.jpg')) {
                                    image_url = 'http://' + image_host_url + i + j
                                    image_urls.push(image_url)
                                }
                            }
                        }
                    }

                    const $hotelTitle = $('<h2></h2>').text(hotelName)
                    const $containerFluid = $('<div></div>', {
                        class: 'container-fluid'
                    })
                    const $row = $('<div></div>', {
                        class: 'row'
                    })
                    const $col_8 = $('<div></div>', {
                        class: 'col-xs-8'
                    })
                    const $ul = $('<ul></ul>')

                    $ul.append(
                        $('<li></li>').text('Hotel name: ' + hotelName)
                    ).append(
                        $('<li></li>').text('Hotel popularity: ' + hotelPopularity)
                    ).append(
                        $('<li></li>').text('Distance from Airport: ' + distanceFromSearch)
                    ).append(
                        $('<li></li>').text('Description: ' + popularityDesc)
                    ).append(
                        $('<li></li>').text('Star Rating: ' + star_rating)
                    )

                    const $col_4 = $('<div></div>', {
                        class: 'col-xs-4'
                    })
                    const $hotelImage = $('<img></img>', {
                        src: image_url || 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150',
                        class: 'img img-responsive img-thumbnail'
                    }).css({
                        height: '150px',
                        width: '150px',
                        'max-height': '200px',
                        'max-width': '200px'
                    })

                    $contentWrapper = $('<div></div>', {
                        class: 'content-wrapper'
                    })
                    $item_container = $('<div></div>', {
                        class: 'item-container'
                    })
                    $container = $('<div></div>', {
                        class: 'container'
                    })
                    $col_12 = $('<div></div>', {
                        class: 'col-md-12'
                    })
                    $product = $('<div></div>', {
                        class: 'product col-md-10 service-image-left'
                    }).css('overflow', 'hidden')
                    $image_container = $('<div></div>', {
                        class: 'container service1-items col-sm-2 col-md-2 pull left'
                    })
                    $contentWrapper.append($item_container).append($container).append($col_12.append($product.append($hotelImage)).append($image_container))

                    for (var i = 0; i < 3 && i < image_urls.length; i++) {
                        $image_container.append($('<a></a>', {
                            class: 'service1-item'
                        }).append($('<img/>', {
                            class: 'img img-responsive img-thumbnail',
                            src: image_urls[i]
                        })))
                    }

                    $containerFluid.append($hotelTitle).append($row.append($col_8.append($contentWrapper)).append($col_4.append($ul)))

                    // Set the content and position of the airport marker
                    hotelMarker.content = $containerFluid[0].outerHTML

                    const pos = {
                        lng: longitude,
                        lat: latitude
                    }

                    hotelMarker.position = pos

                    // Add the marker to the map.
                    sf_map.addMarker(hotelMarker)
                })
            }
        }

        function populateFlightData(response) {
            if ((response.errors || response.error) && response.errorType != 'gettyImageServiceRequest') {
                console.log(response)
                window.alert(JSON.stringify(response.errors))
            } else {
                console.log(response)
                const _button = $('#searchFlights')
                _button.addClass('m-progress')
                const sf_result = response.result

                const dates = this.dates
                const userLocation = this.userLocation
                const origin = this.origin
                const destination = this.destination
                const ticketInfo = this.ticketInfo

                /* Maybe change it to client side polling... */

                _button.off('click')
                _button.on('click', function() {
                    numPolls += 1
                    $.ajax({
                        type: window.seatfilla.globals.site.endpoints.maps.retrieveFlightInfo.method,
                        url: '/maps/pollSkyScannerFlightLivePricingApi',
                        data: {
                            urlEndPoint: response.result.urlEndPoint.url,
                            destinationName: destination.name,
                            newskyscannerpageindex: parseInt(response.itinerary.pageindex) + 1,
                            newgettyimagespageindex: ((numPolls * parseInt(response.itinerary.pagesize))) %
                                parseInt(response.gettyimagespagesize) == 0 ? parseInt(response.gettyimagespageindex) + 1 : response.gettyimagespageindex,
                            gettyimagespagesize: response.gettyimagespagesize,
                            skyscannerpagesize: response.itinerary.pagesize
                        },
                        success: populateFlightData.bind({
                            dates,
                            userLocation,
                            origin,
                            destination,
                            ticketInfo
                        })
                    })
                })

                $('#flightResults').append($('<div></div>', {
                    class: 'well well-sm'
                }).text(JSON.stringify(sf_result.Query)))

                const mapItin = function(itin, directionality, legId) {
                    if (!itin.PricingOptionsMapped) {
                        itin.PricingOptions = itin.PricingOptions.map((pricingOption) => {
                            return {
                                pricingOption,
                                agents: pricingOption.Agents.map((agentId) => {
                                    return {
                                        agentId,
                                        agent: sf_result.Agents.filter((agent) => {
                                            return agent.Id == agentId
                                        }).pop()
                                    }
                                })
                            }
                        })
                        itin.PricingOptionsMapped = true
                    }

                    itin[directionality + 'Legs'] = sf_result.Legs.filter(function(leg) {
                        return leg.Id == legId;
                    }).map(function(leg) {
                        const _output = Object.assign({}, leg)

                        _output.FlightNumbers = leg.FlightNumbers.map(function(flightNumberObj) {
                            const carrierId = flightNumberObj.CarrierId
                            return {
                                flightNumber: flightNumberObj.FlightNumber,
                                carrierId,
                                carrierInfo: sf_result.Carriers.filter((carrier) => {
                                    return carrier.Id == carrierId
                                }).pop()
                            }
                        })

                        _output.SegmentIds = leg.SegmentIds.map(function(segmentId) {
                            return {
                                segmentId,
                                segmentInfo: sf_result.Segments.filter(function(segment) {
                                    return segment.Id == segmentId
                                })
                            }
                        })

                        const destinationStationId = leg.DestinationStation
                        _output.DestinationStation = sf_result.Places.filter(function(place) {
                            return place.Id == destinationStationId
                        }).pop()

                        const originStation = leg.OriginStation
                        _output.OriginStation = sf_result.Places.filter(function(place) {
                            return place.Id == originStation
                        }).pop()

                        return _output
                    })

                    return itin
                }

                sf_result.Itineraries.map(function(itin) {
                    const outboundLegId = itin.OutboundLegId
                    const inboundLegId = itin.InboundLegId

                    mapItin(itin, 'Outbound', outboundLegId)

                    if (inboundLegId) {
                        mapItin(itin, 'Inbound', inboundLegId)
                    }
                    return itin
                }).forEach(function(itin, index) {
                    console.log(itin)

                    /* The outbound and inbound leg ids*/
                    const outboundLegId = itin.OutboundLegId
                    const inboundLegId = itin.InboundLegId

                    /* Now we retrieve the mapped info.. */
                    const bookingDetailsUri = itin.BookingDetailsLink.Uri
                    const bookingDetailsBody = itin.BookingDetailsLink.Body
                    const bookingDetailsMethod = itin.BookingDetailsLink.Method

                    const numberOfOutboundLegs = itin.OutboundLegs.length
                    const numberOfInboundLegs = (itin.InboundLegs && itin.InboundLegs.length) || 0

                    const cityImages = response.cityImages || null
                    const image = (cityImages && cityImages[index] && cityImages[index].image) || ''

                    // Booking details drop down.
                    const $dropDownContent = $('<div></div>', {
                        id: 'detail-' + index
                    })
                    const $dropDownContentInfo = $('<div></div>', {
                        class: 'fluid-row'
                    }).text('booking details')

                    /* Outbound legs drop down */
                    const $outboundLegsDropDown = $('<div></div>', {
                        id: 'outbound-' + index
                    })
                    const $inboundLegsDropDown = $('<div></div>', {
                        id: 'outbound-' + index
                    })
                    const $outboundUl = $('<ul></ul>')

                    const $col12 = $('<div></div>', {
                        'class': 'col-xs-12'
                    })
                    const $getCarrierInfoDropDown = $('<div></div>', {
                        id: 'carrier-' + index
                    }).slideToggle()
                    const $getCarrierInfoDropdownContent = $('<div></div>', {
                        class: 'container-fluid'
                    })
                    const $carrierInfoTable = $('<table></table>', {
                        'class': 'table table-responsive table-bordered table-filtered'
                    })
                    $carrierInfoTable.append(
                        $('<tr></tr>').append(
                            $('<th></th>').text('')
                        ).append(
                            $('<th></th>').text('Carrier name')
                        ).append(
                            $('<th></th>').text('Carrier code')
                        ).append(
                            $('<th></th>').text('Flight number')
                        ).append(
                            $('<th></th>').text('Directionality')
                        ))
                    $getCarrierInfoDropdownContent.append($carrierInfoTable)

                    const $getCarrierInfoButton = $('<input/>', {
                        value: 'Show Carrier Details',
                        type: 'button',
                        class: 'btn  btn-info btn-sm pull-right',
                        'data-toggle': 'carrier-' + index,
                        on: {
                            click: function() {
                                $input = $(this)
                                $target = $('#' + $input.attr('data-toggle'))
                                $target.slideToggle('fast', function() {
                                    if ($target.is(':visible')) {
                                        $input.val('Hide carrier info')
                                    } else {
                                        $input.val('Show carrier info')
                                    }
                                })
                            }
                        }
                    })

                    const $liEle = $('<li></li>', {
                        class: 'list-group-item'
                    })
                    const $panelInfo = $('<div></div>', {
                        class: 'panel panel-default'
                    })
                    const $panelHeading = $('<div></div>', {
                        class: 'panel panel-heading'
                    }).css({
                        'min-height': '50px'
                    })
                    const $panelContent = $('<div></div>', {
                        class: 'panel panel-content'
                    }).css({
                        'padding': '20px'
                    })
                    const $in_group = $('<ul></ul>', {
                        'class': 'pull-right'
                    }).css({
                        'background-color': 'transparent',
                        'display': 'flex',
                        'position': 'relative',
                        'bottom': '6px'
                    })
                    const $li = $('<li></li>').css({
                        'padding': '5px',
                        'display': 'inline-block'
                    })
                    const $row = $('<div></div>', {
                        'class': 'row'
                    })
                    const $col2 = $('<div></div>', {
                        'class': 'col-xs-4'
                    })
                    const $gettyImg = $('<img></img>').attr('height', '100px').attr('width', '100px')
                        .css({
                            'width': '200px',
                            'height': '150px',
                            'min-width': '100px',
                            'min-height': '100px',
                            'padding': '10px',
                            'position': 'relative',
                            'top': '60px',
                            'left': '40px'
                        })
                        .attr('src', image).attr('class', 'img img-responsive img-thumbnail')
                    const $col10 = $('<div></div>', {
                            'class': 'col-xs-8'
                        }) // .text(JSON.stringify(itin))
                    const $panelFooter = $('<div></div>', {
                        'class': 'panel-footer'
                    }).css({
                        'min-height': '50px'
                    })

                    const $getBookingDetailsButton = $('<input/>', {
                        value: 'Get Booking Details',
                        type: 'button',
                        class: 'btn  btn-info btn-sm pull-right',
                        'data-toggle': 'detail-' + index,
                        on: {
                            click: function() {
                                $('#notification').attr('opened', 'true').attr('text', 'Booking details will be loaded shortly')
                                $input = $(this)
                                $target = $('#' + $input.attr('data-toggle'))

                                $input.addClass('m-progress')
                                $.ajax({
                                    type: window.seatfilla.globals.site.endpoints.maps.retrieveBookingDetails.method,
                                    url: window.seatfilla.globals.site.endpoints.maps.retrieveBookingDetails.url,
                                    data: {
                                        sessionkey: sf_result.SessionKey,
                                        outboundLegId,
                                        inboundLegId,
                                        bookingDetailsLink: sf_result.bookingDetailsLink
                                    },
                                    success: function(response, x, xhr) {
                                        if (xhr.status == 200) {
                                            $target.slideToggle('slow', function() {
                                                    $input.removeClass('m-progress')
                                                })
                                                // apend response to dropDownContentInfo
                                        } else {
                                            alert(response)
                                        }
                                    }
                                })
                            }
                        }
                    })

                    const createDynamicLegContent = function($table, $ulEle, legAttr) {
                        itin[legAttr].forEach(function(leg) {
                            console.log(leg)

                            const departureTime = leg.Departure
                            const arrivalTime = leg.Arrival
                            const destinationStationCode = leg.DestinationStation.Code
                            const destinationStationName = leg.DestinationStation.Name
                            const originStationName = leg.OriginStation.Name
                            const originStationCode = leg.OriginStation.Code
                            const directionality = leg.Directionality
                            const flightDuration = leg.Duration
                            const numberOfStops = leg.Stops.length
                            const numberOfSegments = leg.SegmentIds.length
                                // Multiple
                            const carriers = leg.Carriers

                            const $outbound_info_li = $('<li></li>')
                                .append(
                                    $('<p></p>').text('Origin Station Name: ' + originStationName)
                                ).append(
                                    $('<p></p>').text('Origin Station Code: ' + originStationCode)
                                ).append(
                                    $('<p></p>').text('Destination Station Name: ' + destinationStationName)
                                ).append(
                                    $('<p></p>').text('Destination Station Code: ' + destinationStationCode)
                                ).append(
                                    $('<p></p>').text('Departure Time: ' + departureTime)
                                ).append(
                                    $('<p></p>').text('Arrival Time: ' + arrivalTime)
                                ).append(
                                    $('<p></p>').text('Duration: ' + flightDuration)
                                ).append(
                                    $('<p></p>').text('Number of stops: ' + numberOfStops)
                                ).append(
                                    $('<p></p>').text('Number of segments: ' + numberOfSegments)
                                )

                            leg.FlightNumbers.forEach(function(flightNumber) {
                                const fNum = flightNumber.flightNumber
                                const carrierName = flightNumber.carrierInfo.Name
                                const carrierImage = flightNumber.carrierInfo.ImageUrl
                                const carrierCode = flightNumber.carrierInfo.DisplayCode

                                const $carrierImage = $('<img/>', {
                                    'class': 'img img-responsive'
                                }).attr('src', carrierImage)

                                const $t_row = $('<tr></tr>')
                                const $td_carrierImage = $('<td></td>').append($carrierImage)
                                const $td_carrierName = $('<td></td>').text(carrierName)
                                const $td_carrierCode = $('<td></td>').text(carrierCode)
                                const $td_flightNumber = $('<td></td>').text(fNum)
                                const $td_directionality = $('<td></td>').text(directionality)

                                $table.append($t_row
                                    .append($td_carrierImage)
                                    .append($td_carrierName)
                                    .append($td_carrierCode)
                                    .append($td_flightNumber)
                                    .append($td_directionality)
                                )
                            })

                            $ulEle.append($outbound_info_li)
                        })
                        return $ulEle
                    }

                    createDynamicLegContent($carrierInfoTable, $outboundUl, 'OutboundLegs')
                    $outboundLegsDropDown.append($outboundUl)

                    if (itin.InboundLegs) {
                        const $outboundUl = $('<ul></ul>')
                        createDynamicLegContent($carrierInfoTable, $outboundUl, 'InboundLegs')
                        $inboundLegsDropDown.append($outboundUl)
                    }

                    const $getPricingInfoDropDown = $('<div></div>', {
                        id: 'pricing-' + index
                    }).slideToggle()
                    const $getPricingInfoDropdownContent = $('<div></div>', {
                        class: 'container-fluid'
                    })
                    const $pricingInfoTable = $('<table></table>', {
                        'class': 'table table-responsive table-bordered'
                    })
                    const $getPricingDetailsButton = $('<input/>', {
                        value: 'Show Pricing Details',
                        type: 'button',
                        class: 'btn  btn-info btn-sm pull-right',
                        'data-toggle': 'pricing-' + index,
                        on: {
                            click: function() {
                                $('#notification').attr('opened', 'true').attr('text', 'Showing carrier details')
                                $input = $(this)
                                $target = $('#' + $input.attr('data-toggle'))
                                $target.slideToggle('fast', function() {
                                    if ($target.is(':visible')) {
                                        $input.val('Hide pricing info')
                                    } else {
                                        $input.val('Show pricing info')
                                    }
                                })
                            }
                        }
                    })
                    $pricingInfoTable.append(
                        $('<tr></tr>').append(
                            $('<th></th>').text('')
                        ).append(
                            $('<th></th>').text('Booking Number')
                        ).append(
                            $('<th></th>').text('Name')
                        ).append(
                            $('<th></th>').text('Type')
                        ).append(
                            $('<th></th>').text('Price')
                        ).append(
                            $('<th></th>').text('Quote Age (Mins)')
                        ).append(
                            $('<th></th>').text('Booking URL')
                        ))

                    $getPricingInfoDropdownContent.append($pricingInfoTable)

                    itin.PricingOptions.forEach((op) => {
                        const deepLinkUrl = op.pricingOption.DeeplinkUrl
                        const price = op.pricingOption.Price
                        const quoteAgeInMinutes = op.pricingOption.QuoteAgeInMinutes

                        op.agents.forEach((agent) => {
                            const $t_row = $('<tr></tr>')
                            const a = agent.agent
                            const bookingNumber = a.BookingNumber
                            const imgUrl = a.ImageUrl
                            const name = a.Name
                            const type = a.Type

                            const $td_bookingNum = $('<td></td>').text(bookingNumber)
                            const $td_image = $('<td></td>').append(
                                $('<img></img>', {
                                    'class': 'img img-responsive'
                                }).attr('src', imgUrl)
                            )
                            const $td_name = $('<td></td>').text(name)
                            const $td_type = $('<td></td>').text(type)
                            const $td_price = $('<td></td>').text(parseFloat(price).toFixed(2) + ' ' + $('#seatfilla_currencies').val())
                            const $td_quoteAge = $('<td></td>').text(quoteAgeInMinutes)
                            const $td_deepLinkUrl = $('<td></td>').append($('<a></a>', {
                                href: deepLinkUrl,
                                text: 'Book with this ' + type
                            }))

                            $t_row.append($td_image)
                                .append($td_bookingNum)
                                .append($td_name)
                                .append($td_type)
                                .append($td_price)
                                .append($td_quoteAge)
                                .append($td_deepLinkUrl)

                            $pricingInfoTable.append($t_row)
                        })
                    })

                    $panelHeading.text('Flight result ' + (index + 1))

                    if (!itin.InboundLegs) {
                        $col10.append($outboundLegsDropDown)
                    } else {
                        const $col10_row = $('<div></div>', {
                            'class': 'row'
                        })

                        // Outbound column
                        const $col_5_o = $('<div></div>', {
                            'class': 'col-xs-5'
                        })
                        $col_5_o.append($('<h2></h2>').text('Outbound Details'))
                        $col_5_o.append($outboundLegsDropDown)
                        $col10_row.append($col_5_o)

                        // Inbound column
                        const $col_5_i = $('<div></div>', {
                            'class': 'col-xs-5'
                        })
                        $col_5_i.append($('<h2></h2>').text('Inbound Details'))
                        $col_5_i.append($inboundLegsDropDown)
                        $col10_row.append($col_5_i)

                        $col10.append($col10_row)
                    }

                    const $hr = $('<hr/>')
                    $panelContent.append($row.append($col2.append($gettyImg)).append($col10))

                    $panelInfo.append($panelHeading)

                    $panelInfo.append($panelContent)
                    $getPricingInfoDropDown.append($getPricingInfoDropdownContent)
                    $getCarrierInfoDropDown.append($getCarrierInfoDropdownContent)
                    $dropDownContent.append($dropDownContentInfo)

                    $panelInfo.append($getCarrierInfoDropDown).append($hr.clone())
                    $panelInfo.append($getPricingInfoDropDown).append($hr.clone())
                    $panelInfo.append($dropDownContent).append($hr.clone())

                    const $continueWithSeatfillaButton = $('<button></button>', {
                        value: 'Choose this itinerary',
                        type: 'submit',
                        text: 'Choose this itinerary',
                        class: 'btn  btn-success btn-sm pull-right',
                        on: {
                            click: function() {
                                $.ajax({
                                    type: 'POST',
                                    url: '/maps/retrieveHotelInfo',
                                    data: {
                                        origin,
                                        destination,
                                        userLocation,
                                        userLocale: window.seatfilla.globals.getFirstBrowserLanguage(),
                                        ticketInfo,
                                        dates,
                                        currencyCodePreference: $('#seatfilla_currencies').val(),
                                        chosenItinerary: itin
                                    },
                                    success: populateHotelData
                                })
                            }
                        }
                    })

                    /*

                    const $continueWithSeatfillaForm = $('<form></form>', {
                        action: '/Search/Listings/Hotels',
                        method: 'POST'
                    })

                    const $userLocationInput = $('<input/>', {
                        type: 'hidden',
                        name: 'userLocation',
                        value: JSON.stringify(userLocation)
                    })

                    const $userDestinationInput = $('<input/>', {
                        type: 'hidden',
                        name: 'destination',
                        value: JSON.stringify(destination)
                    })

                    const $datesInput = $('<input/>', {
                        type: 'hidden',
                        name: 'dates',
                        value: JSON.stringify(dates)
                    })

                    const $ticketInfoInput = $('<input/>', {
                        type: 'hidden',
                        name: 'ticketInfo',
                        value: JSON.stringify(ticketInfo)
                    })

                    const $chosenItinInput = $('<input/>', {
                        type: 'hidden',
                        name: 'chosenItinerary',
                        value: JSON.stringify(itin)
                    })
                    const $originInput = $('<input/>', {
                        type: 'hidden',
                        name: 'origin',
                        value: JSON.stringify(origin)
                    })

                    $continueWithSeatfillaForm
                        .append($userLocationInput)
                        .append($datesInput)
                        .append($ticketInfoInput)
                        .append($chosenItinInput)
                        .append($userDestinationInput)
                        .append($originInput)
                        .append($continueWithSeatfillaButton);*/

                    $in_group.append($li.clone().append($continueWithSeatfillaButton))
                    $in_group.append($li.clone().append($getCarrierInfoButton))
                    $in_group.append($li.clone().append($getPricingDetailsButton))
                    $in_group.append($li.clone().append($getBookingDetailsButton))

                    $panelFooter.append($in_group)
                    $panelInfo.append($panelFooter)
                    $liEle.append($panelInfo)

                    $('#flightResults').append($liEle)
                })
            }
            _button.removeClass('m-progress')
            $('[id^=detail-]').hide()
        }

        function retrieveFlightData() {
            _button = $('#searchFlights')
            _button.addClass('m-progress')

            /* If we dont have the correct dates, submit the form to show native HTML5 errors */
            var $datesForm = $('#datesForm')
            if (!$datesForm[0].checkValidity()) {
                $datesForm.find(':submit').click()
                _button.removeClass('m-progress')
                return
            }

            const destination = this.marker.data
            const origin = this.origin

            console.log(destination)
            console.log('destination data: ' + JSON.stringify(destination))
            console.log('origin data:' + JSON.stringify(origin))
            console.log('user position:' + JSON.stringify(sf_map.position))
            console.log('user location: ' + JSON.stringify(sf_map.location))

            const departure = $('#departure_date').val()
            const arrival = $('#return_date').val()
            const numChildTickets = $('#num_child_tickets').val()
            const numAdultTickets = $('#num_adult_tickets').val()
            const numInfantTickets = $('#num_infant_tickets').val()
            const prefferedCabinClass = $('#cabin_class').val()
            const groupPricing = $('#group_pricing').val()
            const dates = {
                departure,
                arrival
            }
            const ticketInfo = {
                numAdultTickets,
                numChildTickets,
                numInfantTickets
            }
            const userLocation = sf_map.location

            $.ajax({
                type: window.seatfilla.globals.site.endpoints.maps.retrieveFlightInfo.method,
                url: window.seatfilla.globals.site.endpoints.maps.retrieveFlightInfo.url,
                data: {
                    origin,
                    destination,
                    userPosition: sf_map.position,
                    userLocation,
                    userLocale: window.seatfilla.globals.getFirstBrowserLanguage(),
                    ticketInfo,
                    dates,
                    prefferedCabinClass,
                    currencyCodePreference: $('#seatfilla_currencies').val(),
                    groupPricing
                },
                success: populateFlightData.bind({
                    dates,
                    userLocation,
                    origin,
                    destination,
                    ticketInfo
                })
            })
        }

        const findFlightsOnClickHandler = function() {
            const coords = $(this).attr('data-coords')
            const marker = sf_map.getMarkerJsonString(coords)

            const $selectedOriginAirport = $('#airports_selections').find(':selected')
            const continentIdx = $selectedOriginAirport.attr('data-continent-index')
            const countryIdx = $selectedOriginAirport.attr('data-country-index')
            const cityIdx = $selectedOriginAirport.attr('data-city-index')
            const airportIdx = $selectedOriginAirport.attr('data-airport-index')

            const airportPos = JSON.parse($selectedOriginAirport.attr('value'))

            const countryName = country.Name
            const countryId = country.Id
            const currency = country.CurrencyId

            /*Build our final data*/
            const origin = Object.assign({}, {
                continentId: airportData.Continents[continentIdx].Id,
                continentName: airportData.Continents[continentIdx].Name
            }, {
                countryName: airportData.Continents[continentIdx].Countries[countryIdx].Name,
                countryId: airportData.Continents[continentIdx].Countries[countryIdx].Id,
                currency: airportData.Continents[continentIdx].Countries[countryIdx].CurrencyId
            }, {
                countryId: airportData.Continents[continentIdx].Countries[countryIdx].Cities[cityIdx].CountryId,
                location: airportData.Continents[continentIdx].Countries[countryIdx].Cities[cityIdx].Location,
                iataCode: airportData.Continents[continentIdx].Countries[countryIdx].Cities[cityIdx].IataCode,
                id: airportData.Continents[continentIdx].Countries[countryIdx].Cities[cityIdx].Id,
                name: airportData.Continents[continentIdx].Countries[countryIdx].Cities[cityIdx].Name
            }, {
                airportPos,
                airportName: airportData.Continents[continentIdx].Countries[countryIdx].Cities[cityIdx].Airports[airportIdx].Name,
                airportId: airportData.Continents[continentIdx].Countries[countryIdx].Cities[cityIdx].Airports[airportIdx].Id,
                airportCityId: airportData.Continents[continentIdx].Countries[countryIdx].Cities[cityIdx].Airports[airportIdx].CityId,
                airportCountryId: airportData.Continents[continentIdx].Countries[countryIdx].Cities[cityIdx].Airports[airportIdx].CountryId,
                airportLocation: airportData.Continents[continentIdx].Countries[countryIdx].Cities[cityIdx].Airports[airportIdx].Location
            })

            var now = new Date()
            var day = ('0' + now.getDate()).slice(-2)
            var month = ('0' + (now.getMonth() + 1)).slice(-2)
            var today = now.getFullYear() + '-' + (month) + '-' + (day)

            $('#departure_date').attr('min', today).val(today)
            $('#flightResults').html('')

            // Unbind any existing listeners so we dont send the request more than once
            $('#searchFlights').off('click')
            $('#searchFlights').on('click', retrieveFlightData.bind({
                origin,
                marker
            }))
        }

        /* Add support for geocoding later.. 
             
                 Location callback...
                {
                    coords: {
                        latitude: 37.4224764,
                        longitude: -122.0842499
                    },
                    address: {
                        commonName: "",
                        street: "Amphitheatre Pkwy",
                        route: "Amphitheatre Pkwy",
                        streetNumber: "1600",
                        neighborhood: "",
                        town: "",
                        city: "Mountain View",
                        region: "Santa Clara County",
                        state: "California",
                        stateCode: "CA",
                        postalCode: "94043",
                        country: "United States",
                        countryCode: "US"
                    },
                    formattedAddress: "1600 Amphitheatre Parkway, Mountain View, CA 94043, USA",
                    type: "ROOFTOP",
                    placeId: "ChIJ2eUgeAK6j4ARbn5u_wAGqWA",
                    flag: "//cdnjs.cloudflare.com/ajax/libs/flag-icon-css/2.3.1/flags/4x3/us.svg",
                    map: {
                        element: HTMLElement,
                        instance: Object, // google.maps.Map
                        marker: Object, // google.maps.Marker
                        infoWindow: Object, // google.maps.InfoWindow
                        options: Object // map options
                    },
                    timestamp: 1456795956380
                }
                //Address = user address
                geolocator.geocode(address, function (err, location) {
                    console.log(err || location)
                })
                */



        function handle(obj) {
            $(this.element).append($('<option></option>')
                .attr('data-continent-index', obj.continentIndex)
                .attr('data-country-index', obj.countryIndex)
                .attr('data-city-index', obj.key)
                .attr('data-airport-index', obj.airportIndex)
                .attr('value', obj.jsonPos)
                .text(obj.airportName + ', ' + obj.name + ', ' + obj.countryName + ', ' + obj.continentName))

            if (this.options && this.options.addMarkers) {
                const div = document.createElement('div')
                const h2 = document.createElement('h2')
                const p = document.createElement('p')

                h2.innerHTML = obj.airportName
                p.innerHTML = 'Country: ' + obj.countryName + '<br>' + 'City: ' + name + '<br>'

                div.appendChild(h2)
                div.appendChild(p)

                const input = $('<input />', {
                    type: 'button',
                    value: 'Find flights',
                    'data-coords': obj.jsonPos,
                    'data-target': '#myModal',
                    class: 'btn btn-primary',
                    'data-toggle': 'modal',
                    on: {
                        click: findFlightsOnClickHandler
                    }
                })

                $(div).append(input)

                /*End of dynamic content*/

                // Set the content and position of the airport marker
                airportMarker.content = div
                airportMarker.position = obj.pos

                // Set the markers data to the airport data
                airportMarker.data = obj

                // Add the marker to the map.
                sf_map.addMarker(airportMarker)
            }
        }

        window.seatfilla.globals.geolocation.queryAirports([sf_map.location.address.region, sf_map.location.address.city],
            handle.bind({
                element: $('#airports_selections'),
                options: {
                    addMarkers: false
                }
            }))

        $('#Search').click(function() {

            /* Remove all the markers from the seatfilla map */
            sf_map.removeAllMarkers()

            /* Remove a line if there is one */
            if (line) line.setMap(null)

            /* Clear the destination airports select*/
            $('#destination_airports').html('')

            /* Get the destination query */
            const query = $('#destination_query').val()

            window.seatfilla.globals.geolocation.queryAirports([query], handle.bind({
                element: $('#destination_airports'),
                options: {
                    addMarkers: true
                }
            }))
        })

        $('#destination_airports').on('change', function() {
            var to = JSON.parse($(this).val())
            const marker = sf_map.getMarker(to)
            if (line) line.setMap(null)

            line = sf_map.createAnimatedLineSymbol({
                path: [from, to],
                icons: [{
                    icon: planeSymbol,
                    offset: '0%',
                    repeat: '100px'
                }],
                strokeOpacity: 0.5,
                strokeColor: '#FFF'
            })

            marker.infowindow.open(sf_map.map, marker.marker)
        })

        const legend = document.getElementById('legend')
        for (var key in icons) {
            var type = icons[key]
            var name = key
            var icon = type.url
            var div = document.createElement('div')
            div.innerHTML = '<img src="' + icon + '"> ' + name
            legend.appendChild(div)
        }

        sf_map.addLegend(legend, google.maps.ControlPosition.TOP_LEFT)
    })({
        airportData: window.seatfilla.globals.retrieveGeoData()
    })
})