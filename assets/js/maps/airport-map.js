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
        });

        /* Populate the text boxes */
        $('#departure_city').val(sf_map.location.address.region);
        $('#departure_country').val(sf_map.location.address.country);
        $('#location').text(sf_map.location.formattedAddress);
        $('#country_flag').attr('src', sf_map.location.flag);


        const airportData = options.airportData;


        var line;

        //SVG path for a plane
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
            draggable: true,
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
                        var result = geolocator.calcDistance({ from, to });

                        if (line) line.setMap(null);

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
                        _marker = this;
                        /* Get the longitude and latitude of the airport */
                        const pos = {
                            lng: _marker.data.Longitude,
                            lat: _marker.data.Latitude
                        }

                        /* Get the longitude and latitude */
                        const jsonPos = JSON.stringify(pos);

                        $('#destination_airports option[value=\'' + jsonPos + '\']').attr('selected', true);
                    }
                ]
            },
            content: '<h1>Its an airport!</h1>'
        }

        const findFlightsOnClickHandler = function() {

            const coords = $(this).attr('data-coords');
            const marker = sf_map.getMarkerJsonString(coords);

            const $selectedOriginAirport = $('#airports_selections').find(":selected");
            const continentIdx = $selectedOriginAirport.attr('data-continent-index');
            const countryIdx = $selectedOriginAirport.attr('data-country-index');
            const cityIdx = $selectedOriginAirport.attr('data-city-index');
            const airportIdx = $selectedOriginAirport.attr('data-airport-index');

            const airportPos = JSON.parse($selectedOriginAirport.attr('value'));

            const countryName = country.Name;
            const countryId = country.Id;
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
            });

            var now = new Date();
            var day = ("0" + now.getDate()).slice(-2);
            var month = ("0" + (now.getMonth() + 1)).slice(-2);
            var today = now.getFullYear() + "-" + (month) + "-" + (day);

            $('#departure_date').attr('min', today).val(today);


            function handleClick() {

                console.log(now);

                $("#flightResults").html("");

                _button = $(this);
                _button.addClass('m-progress');

                /* If we dont have the correct dates, submit the form to show native HTML5 errors */
                var $datesForm = $('#datesForm')
                if (!$datesForm[0].checkValidity()) {
                    $datesForm.find(':submit').click()
                    _button.removeClass('m-progress');
                    return;
                }

                const data = marker.data;

                console.log(data);
                console.log('destination data: ' + JSON.stringify(data));
                console.log('origin data:' + JSON.stringify(origin));
                console.log('user position:' + JSON.stringify(sf_map.position));
                console.log('user location: ' + JSON.stringify(sf_map.location));

                const departure = $('#departure_date').val();
                console.log(departure);
                const arrival = $('#return_date').val();
                const numChildTickets = $('#num_child_tickets').val();
                const numAdultTickets = $('#num_adult_tickets').val();
                const numInfantTickets = $('#num_infant_tickets').val();
                const prefferedCabinClass = $("#cabin_class").val();
                const groupPricing = $("#group_pricing").val();

                $.ajax({
                    type: window.seatfilla.globals.site.endpoints.maps.retrieveFlightInfo.method,
                    url: window.seatfilla.globals.site.endpoints.maps.retrieveFlightInfo.url,
                    data: {
                        origin,
                        destination: data,
                        userPosition: sf_map.position,
                        userLocation: sf_map.location,
                        userLocale: window.seatfilla.globals.getFirstBrowserLanguage(),
                        ticketInfo: { numAdultTickets, numChildTickets, numInfantTickets },
                        dates: { departure, arrival },
                        prefferedCabinClass,
                        groupPricing
                    },
                    success: function(response) {
                        if ((response.errors || response.error) && response.errorType != 'gettyImageServiceRequest') {
                            console.log(response);
                            window.alert(JSON.stringify(response.errors));
                        } else {
                            const sf_result = response.result;

                            $("#flightResults").html("");
                            $("#flightResults").append($('<div></div>', { class: 'well well-sm' }).text(JSON.stringify(sf_result.Query)));

                            const mapItin = function(itin, directionality, legId) {
                                itin.PricingOptions.forEach((pricingOption) => {
                                    pricingOption.Agents = pricingOption.Agents.map((agentId) => {
                                        return {
                                            agentId,
                                            agentInfo: sf_result.Agents.filter((agent) => {
                                                agent.Id = agentId;
                                            })
                                        }
                                    });
                                });

                                itin[directionality + 'Legs'] = sf_result.Legs.filter(function(leg) {
                                    return leg.Id == legId;
                                }).map(function(leg) {

                                    leg.FlightNumbers.map(function(flightNumberObj) {
                                        const carrierId = flightNumberObj.CarrierId;
                                        flightNumberObj.CarrierId = {
                                            carrierId,
                                            carrierInfo: sf_result.Carriers.filter((carrier) => {
                                                return carrier.Id == carrierId;
                                            }).pop()
                                        }
                                    });

                                    leg.SegmentIds = leg.SegmentIds.map(function(segmentId) {
                                        return {
                                            segmentId,
                                            segmentInfo: sf_result.Segments.filter(function(segment) {
                                                return segment.Id == segmentId;
                                            })
                                        }
                                    });

                                    const destinationStationId = leg.DestinationStation;
                                    leg.DestinationStation = sf_result.Places.filter(function(place) {
                                        return place.Id == destinationStationId;
                                    }).pop();

                                    const originStation = leg.OriginStation;
                                    leg.OriginStation = sf_result.Places.filter(function(place) {
                                        return place.Id == originStation;
                                    }).pop();

                                    return leg;
                                });

                                return itin;
                            }


                            sf_result.Itineraries.map(function(itin) {
                                const outboundLegId = itin.OutboundLegId;
                                const inboundLegId = itin.InboundLegId;

                                mapItin(itin, 'Outbound', outboundLegId);

                                if (inboundLegId) {
                                    mapItin(itin, 'Inbound', inboundLegId);
                                }
                                return itin;

                            }).forEach(function(itin, index) {

                                console.log(itin);

                                /* The outbound and inbound leg ids*/
                                const outboundLegId = itin.OutboundLegId;
                                const inboundLegId = itin.InboundLegId;

                                /* Now we retrieve the mapped info.. */
                                const bookingDetailsUri = itin.BookingDetailsLink.Uri;
                                const bookingDetailsBody = itin.BookingDetailsLink.Body;
                                const bookingDetailsMethod = itin.BookingDetailsLink.Method;

                                const numberOfOutboundLegs = itin.OutboundLegs.length;
                                const numberOfInboundLegs = (itin.InboundLegs && itin.InboundLegs.length) || 0;

                                const cityImages = response.cityImages || null;
                                const image = (cityImages && cityImages[index] && cityImages[index].image) || '';

                                //Booking details drop down.
                                const $dropDownContent = $('<div></div>', { id: 'detail-' + index, });
                                const $dropDownContentInfo = $('<div></div>', { class: 'fluid-row', }).text('booking details');

                                const createLegUl = function($ulEle, legAttr) {
                                    itin[legAttr].forEach(function(leg) {
                                        const departureTime = leg.Departure;
                                        const arrivalTime = leg.Arrival;
                                        const destinationStationCode = leg.DestinationStation.Code;
                                        const destinationStationName = leg.DestinationStation.Name;
                                        const originStationName = leg.OriginStation.Name;
                                        const originStationCode = leg.OriginStation.Code;

                                        const directionality = leg.Directionality;
                                        const flightDuration = leg.Duration;

                                        const numberOfStops = leg.Stops.length;
                                        const numberOfSegments = leg.SegmentIds.length;

                                        //Multiple
                                        const carriers = leg.Carriers;
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
                                                $('<p></p>').text('Number of stops: ' + numberOfStops)
                                            ).append(
                                                $('<p></p>').text('Number of segments: ' + numberOfSegments)
                                            );
                                        $ulEle.append($outbound_info_li);
                                    });
                                    return $ulEle;
                                }

                                /*Outbound legs drop down */
                                const $outboundLegsDropDown = $('<div></div>', { id: 'outbound-' + index, });
                                const $outboundInfoButton = $('<input/>', {
                                    value: 'View outbound details',
                                    type: 'button',
                                    class: 'btn  btn-info btn-sm pull-right',
                                    'data-toggle': 'outbound-' + index,
                                });

                                const $outboundUl = $('<ul></ul>');
                                createLegUl($outboundUl, 'OutboundLegs');
                                $outboundLegsDropDown.append($outboundUl);
                                /***********************************/

                                /*Inbound legs drop down */
                                const $inboundLegsDropDown = $('<div></div>', { id: 'outbound-' + index, });
                                const $inboundInfoButton = $('<input/>', {
                                    value: 'View Inbound Details',
                                    type: 'button',
                                    class: 'btn  btn-info btn-sm pull-right',
                                    'data-toggle': 'outbound-' + index,
                                });
                                /***********************************/

                                //Inbound isn't required, so check we have it..
                                if (itin.InboundLegs) {
                                    const $outboundUl = $('<ul></ul>');
                                    createLegUl($outboundUl, 'InboundLegs');
                                    $inboundLegsDropDown.append($outboundUl);
                                }

                                const $liEle = $('<li></li>', { class: 'list-group-item', });
                                const $panelInfo = $('<div></div>', { class: 'panel panel-info' });
                                const $panelHeading = $('<div></div>', { class: 'panel panel-heading' }).css({ 'min-height': '50px' });

                                const $panelContent = $('<div></div>', { class: 'panel panel-content' });
                                const $panelContent2 = $('<div></div>', { class: 'panel panel-content' });
                                const $row = $('<div></div>', { 'class': 'row' });
                                const $col2 = $('<div></div>', { 'class': 'col-xs-2' });
                                const $gettyImg = $('<img></img>').attr('height', '100px').attr('width', '100px').css({ 'width': '200px', 'height': '150px', 'min-width': '100px', 'min-height': '100px', 'margin-left': '20px' }).attr('src', image).attr('class', 'img img-responsive img-thumbnail');
                                const $col10 = $('<div></div>', { 'class': 'col-xs-10' }) //.text(JSON.stringify(itin));
                                const $panelFooter = $('<div></div>', { 'class': 'panel-footer' }).css({ 'min-height': '50px' });
                                const $getBookingDetailsButton = $('<input/>', {
                                    value: 'Get booking details',
                                    type: 'button',
                                    class: 'btn  btn-info btn-sm pull-right',
                                    'data-toggle': 'detail-' + index,
                                    on: {
                                        click: function() {
                                            $('#notification').attr('opened', 'true').attr('text', 'Booking details will be loaded shortly');
                                            $input = $(this);
                                            $target = $('#' + $input.attr('data-toggle'));

                                            $input.addClass('m-progress');
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
                                                            $input.removeClass('m-progress');
                                                        });
                                                        //apend response to dropDownContentInfo
                                                    } else {
                                                        alert(response);
                                                    }
                                                }
                                            });

                                        }
                                    }
                                });

                                $panelHeading.append($outboundInfoButton);
                                $col10.append($outboundLegsDropDown);

                                if (itin.InboundLegs) {
                                    $panelHeading.append($inboundInfoButton);
                                    $col10.append($inboundLegsDropDown);
                                }

                                $panelContent.append($row.append($col2.append($gettyImg)).append($col10));

                                $panelInfo.append($panelHeading);
                                $panelInfo.append($panelContent);
                                $dropDownContent.append($dropDownContentInfo);


                                $panelInfo.append($dropDownContent);
                                $panelFooter.append($getBookingDetailsButton);
                                $panelInfo.append($panelFooter);
                                $liEle.append($panelInfo);

                                $('#flightResults').append($liEle);
                            });
                        }

                        $('[id^=detail-]').hide();
                        _button.removeClass('m-progress');
                    },
                });
            }

            //Unbind any existing listeners so we dont send the request more than once
            $('#searchFlights').off('click');
            $('#searchFlights').on('click', handleClick);
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
                    console.log(err || location);
                });
                */

        function populate(query, $element, options) {
            const option = $('<option></option>');
            airportData.Continents.forEach(function(continent, continentIndex) {
                const continentId = continent["Id"];
                const continentName = continent["Name"];

                continent.Countries.forEach(function(country, countryIndex) {
                    const countryName = country.Name;
                    const countryId = country.Id;
                    const currency = country.CurrencyId


                    loop: for (var key in country.Cities) {
                        //sf_map.location.address.region
                        //sf_map.location.address.city

                        const countryId = country.Cities[key]["CountryId"];
                        const location = country.Cities[key]["Location"];
                        const iataCode = country.Cities[key]["IataCode"];
                        const id = country.Cities[key]["Id"];
                        const name = country.Cities[key]["Name"];
                        var any = false;
                        for (var k in query) {
                            var q = query[k];

                            if (name == q ||
                                countryName == q ||
                                countryId == q ||
                                id == q ||
                                iataCode == q) {
                                any = true;
                            }
                        }

                        if (!any) {
                            continue loop;
                        }

                        console.log(JSON.stringify(country.Cities))
                        for (var airportIndex in country.Cities[key].Airports) {

                            const loc = country.Cities[key].Airports[airportIndex]["Location"].split(', ');
                            /* Get the longitude and latitude of the airport */
                            console.log('loc = ' + loc);
                            const pos = {
                                lng: parseInt(loc[0]),
                                lat: parseInt(loc[1])
                            }

                            /* Get the longitude and latitude */
                            const jsonPos = JSON.stringify(pos);

                            $element
                                .append($('<option></option>')
                                    .attr('data-continent-index', continentIndex)
                                    .attr('data-country-index', countryIndex)
                                    .attr('data-city-index', key)
                                    .attr('data-airport-index', airportIndex)
                                    .attr('value', jsonPos)
                                    .text(country.Cities[key].Airports[airportIndex]["Name"] + ', ' + name + ', ' + countryName + ', ' + continentName));

                            /* Dynamically create content for the info window of the google map */
                            if (options && options.addMarkers) {
                                const div = document.createElement('div');
                                const h2 = document.createElement('h2');
                                const p = document.createElement('p');

                                h2.innerHTML = country.Cities[key].Airports[airportIndex]["Name"];
                                p.innerHTML = 'Country: ' + countryName + '<br>' + 'City: ' + name + '<br>';

                                div.appendChild(h2);
                                div.appendChild(p);


                                const input = $('<input />', {
                                    type: 'button',
                                    value: 'Find flights',
                                    'data-coords': jsonPos,
                                    'data-target': '#myModal',
                                    class: 'btn btn-primary',
                                    'data-toggle': 'modal',
                                    on: {
                                        click: findFlightsOnClickHandler
                                    }
                                });

                                $(div).append(input);

                                /*End of dynamic content*/

                                //Set the content and position of the airport marker
                                airportMarker.content = div;
                                airportMarker.position = pos;

                                //Set the markers data to the airport data
                                airportMarker.data = Object.assign({}, { continentId, continentName }, { countryName, countryId, currency }, { countryId, location, iataCode, id, name }, //city
                                    {
                                        airportPos: pos,
                                        airportName: country.Cities[key].Airports[airportIndex].Name,
                                        airportId: country.Cities[key].Airports[airportIndex].Id,
                                        airportyCityId: country.Cities[key].Airports[airportIndex].CityId,
                                        airportCountryId: country.Cities[key].Airports[airportIndex].CountryId,
                                        airportLocation: country.Cities[key].Airports[airportIndex].Location
                                    });


                                //Add the marker to the map.
                                sf_map.addMarker(airportMarker);
                            }
                        }
                    }

                });
            });
        }
        populate([sf_map.location.address.region, sf_map.location.address.city], $('#airports_selections'));


        $('#Search').click(function() {

            /* Remove all the markers from the seatfilla map */
            sf_map.removeAllMarkers();

            /* Remove a line if there is one */
            if (line) line.setMap(null)

            /* Clear the destination airports select*/
            $('#destination_airports').html("");

            /* Get the destination query */
            const query = $('#destination_query').val();

            populate([query], $('#destination_airports'), { addMarkers: true });


        });

        $('#destination_airports').on('change', function() {
            var to = JSON.parse($(this).val());
            const marker = sf_map.getMarker(to);
            if (line) line.setMap(null);

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

            marker.infowindow.open(sf_map.map, marker.marker);
        });

        const legend = document.getElementById('legend');
        for (var key in icons) {
            var type = icons[key];
            var name = key;
            var icon = type.url;
            var div = document.createElement('div');
            div.innerHTML = '<img src="' + icon + '"> ' + name;
            legend.appendChild(div);
        }

        sf_map.addLegend(legend, google.maps.ControlPosition.TOP_LEFT);
    })({ airportData: window.seatfilla.globals.retrieveGeoData() });
});