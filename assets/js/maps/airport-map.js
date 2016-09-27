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
                        var pos = {
                            lng: event.latLng.lng(),
                            lat: event.latLng.lat()
                        }
                        $('#destination_airports').val(JSON.stringify(pos));
                    }
                ]
            },
            content: '<h1>Its an airport!</h1>'
        }

        const findFlightsOnClickHandler = function() {
            const coords = $(this).attr('data-coords');
            const marker = sf_map.getMarkerJsonString(coords);
            const airportDataKey = $('#airports_selections').find(":selected").attr('id');
            const originAirport = airport_data[airportDataKey];

            $('#searchFlights').on('click', function() {
                const data = marker.data;


                console.log('destination data: ' + JSON.stringify(data));
                console.log('origin data:' + JSON.stringify(originAirport));
                console.log('user position:' + JSON.stringify(sf_map.position));
                console.log('user location: ' + JSON.stringify(sf_map.location));

                const departure = $('#departure_date').val();
                const arrival = $('#arrival_date').val();
                const numChildTickets = $('#num_child_tickets').val();
                const numAdultTickets = $('#num_adult_tickets').val();
                const numInfantTickets = $('#num_infant_tickets').val();

                const destinationAirportLngLat = {
                    longitude: data.Longitude,
                    latitude: data.Latitude
                }

                console.log(JSON.stringify(destinationAirportLngLat));

                const originAirportLngLat = {
                    longitude: originAirport.Longitude,
                    latitude: originAirport.Latitude
                }


                console.log(JSON.stringify(originAirportLngLat));

                geolocator.reverseGeocode(destinationAirportLngLat, function(err, destinationAirportLocation) {
                    geolocator.reverseGeocode(originAirportLngLat, function(err, originAirportLocation) {
                        $.ajax({
                            type: "POST",
                            url: window.seatfilla.globals.site.endpoints.maps.retrieveFlightInfo,
                            data: {
                                origin: originAirport,
                                destination: data,
                                destinationAirportLocation,
                                originAirportLocation,
                                userPosition: sf_map.position,
                                userLocation: sf_map.location,
                                userLocale: window.seatfilla.globals.getFirstBrowserLanguage(),
                                ticketInfo: { numAdultTickets, numChildTickets, numInfantTickets },
                                dateInfo: { departure, arrival }
                            },
                            success: function(response) {

                            },
                        });
                    });
                });
            });
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

        /* Retrieve airports data */
        const airport_data = window.seatfilla.globals.sf_retrieveAirportData();
        const airportDataKeys = Object.keys(airport_data).sort(function(one, two) {
            const data1 = airport_data[one];
            const data2 = airport_data[two];

            return data1.City.localeCompare(data2.City);
        });;

        /* Populate the text boxes */
        $('#departure_city').val(sf_map.location.address.region);
        $('#departure_country').val(sf_map.location.address.country);
        $('#location').text(sf_map.location.formattedAddress);
        $('#country_flag').attr('src', sf_map.location.flag);

        /* Populate origin airports */
        airportDataKeys.forEach(function(key) {
            const data = airport_data[key];
            const option = $('<option></option>').attr('id', key).text(data.Name);

            if (data.City == sf_map.location.address.region || data.Country == sf_map.location.address.city) {
                $('#airports_selections').append(option);
            }
        });

        $('#Search').click(function() {

            /* Remove all the markers from the seatfilla map */
            sf_map.removeAllMarkers();

            /* Remove a line if there is one */
            if (line) line.setMap(null)

            /* Clear the destination airports select*/
            $('#destination_airports').html("");

            /* Get the destination query */
            const query = $('#destination_query').val();

            /* Locate airports for a particular destination */
            airportDataKeys.forEach(function(key) {
                /* Get the data */
                const data = airport_data[key];

                /* If we have a match... */
                if (data.City == query || data.Country == query) {

                    /* Get the longitude and latitude of the airport */
                    const pos = {
                        lng: data.Longitude,
                        lat: data.Latitude
                    }

                    /* Get the longitude and latitude */
                    const jsonPos = JSON.stringify(pos);

                    /* Note that this can be extracted to a sep file, and use ajax.load)*/

                    /* Dynamically create content for the info window of the google map */
                    const div = document.createElement('div');
                    const h2 = document.createElement('h2');
                    const p = document.createElement('p');

                    h2.innerHTML = data.Name;
                    p.innerHTML = 'Country: ' + data.Country + '<br>' + 'City: ' + data.City + '<br>';

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

                    //Also append the destination airports to a select.
                    const element = $('<option></option>').html(data.Name).attr('value', jsonPos);
                    $('#destination_airports').append(element);

                    //Set the markers data to the airport data
                    airportMarker.data = data;

                    //Add the marker to the map.
                    sf_map.addMarker(airportMarker);
                }
            });
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
    })();
});