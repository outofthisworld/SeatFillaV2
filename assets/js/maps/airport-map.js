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
                    function sendServerRequest(event) {
                        if (sf_map.isGeoLocatedPosition(to)) return;

                        const marker = this;
                        const data = marker.data;
                        console.log(marker);

                        data.Locale = getFirstBrowserLanguage();
                        $.ajax({
                            type: "POST",
                            url: window.seatfilla.globals.site.baseURL.concat(
                                window.seatfilla.globals.site.endpoints.maps.retrieveFlightInfo),
                            data: data,
                            success: function(response) {

                            },
                        });
                    },
                    function updateSelection(event) {
                        var pos = {
                            lat: event.latLng.lat(),
                            lng: event.latLng.lng(),
                        }
                        $('#destination_airports').val(JSON.stringify(pos));
                    }
                ]
            },
            content: '<h1>Its an airport!</h1>'
        }

        const airport_data = window.seatfilla.globals.sf_retrieveAirportData();
        const airportDataKeys = Object.keys(airport_data).sort(function(one, two) {
            const data1 = airport_data[one];
            const data2 = airport_data[two];

            return data1.City.localeCompare(data2.City);
        });;

        console.log(sf_map.location);
        $('#departure_city').val(sf_map.location.address.region);
        $('#departure_country').val(sf_map.location.address.country);
        $('#location').text(sf_map.location.formattedAddress);
        $('#country_flag').attr('src', sf_map.location.flag);

        airportDataKeys.forEach(function(key) {
            const data = airport_data[key];
            const option = document.createElement('option');
            option.innerHTML = data.Name;

            if (data.City == sf_map.location.address.region || data.Country == sf_map.location.address.city) {
                $('#airports_selections').append(option.outerHTML);
            }
        });

        $('#Search').click(function() {
            const departureCity = $('#departure_city').val();
            const departureCountry = $('#departure_country').val();

            const query = $('#destination_query').val();

            airportDataKeys.forEach(function(key) {
                const data = airport_data[key];
                if (data.City == query || data.Country == query) {
                    const pos = {
                        lng: data.Longitude,
                        lat: data.Latitude
                    }

                    const jsonPos = JSON.stringify(pos);

                    /* Note that this can be extracted to a sep file, and use ajax.load)*/
                    const div = document.createElement('div');
                    const h2 = document.createElement('h2');
                    const p = document.createElement('p');

                    h2.innerHTML = data.Name;
                    p.innerHTML = 'Country: ' + data.Country + '<br>' + 'City: ' + data.City + '<br>';

                    div.appendChild(h2);
                    div.appendChild(p);

                    const input =  $('<input/>').attr('type', 'button')
                        .attr('class', 'btn btn-primary')
                        .attr('value', 'Find flights').attr('data-coords', jsonPos);

                    $(div).append(input);

                    /*End of dynamic content*/

                    airportMarker.content = div.outerHTML;
                    airportMarker.position = pos;

                    const element = $('<option></option>').html(data.Name).attr('value', jsonPos);
                    $('#destination_airports').append(element);

                    airportMarker.data = data;
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