/*

    Created by Dale.
    
    Contains the logic for integrating the site with googlemaps
    and the javascript geolocation API.

    To find a users location the following methods are used:

    1. We try to locate the user using the geolocation 
    2. We fall back to using their I.P address to determine the location
    3. If all else fails, we try to use the HTML5 geolocation API to detemine the users location.
    4. We fail safe, and use the middle of the map.

    This javascript file also contains the logic for handling the creation/logic of google maps.
*/


//var obj = {}
//_sf_map.call(obj,params)
//obj.prototype = _sf_map.prototype

var _seat_filla_map = function(options) {

    var _instance = {};
    _instance.map = null;
    _instance.markers = {};


    _instance.createLine = function(options) {
        if (!options) throw new Error('Invalid params passed to createLine');

        options.map = _instance.map;
        var line = new google.maps.Polyline(options);

        return line;
    }

    _instance.createAnimatedLineSymbol = function(options) {
        if (!options) throw new Error('Invalid params passed to createLine');

        var line = _instance.createLine(options);
        _instance.animateLineSymbols(line, options.interval);

        return line;
    }

    _instance.animateLineSymbols = function(line, interval) {
        var count = 0;
        window.setInterval(function() {
            count = (count + 1) % 200;

            var icons = line.get('icons');

            for (var key in icons) {
                icons[key].offset = (count / 2) + '%';
            }
            line.set('icons', icons);
        }, interval || 50);
    }

    _instance.getMarker = function(latLng) {
        return _intance.markers[JSON.stringify(latLng)];
    }

    _instance.addMapClickListener = function(handler) {
        google.maps.event.addListener(_instance.map, 'click', handler);
    }

    _instance.addMarker = function(markerOpts, cb) {

        if (!markerOpts) {
            throw new Error('Invalid args passed to addMarker (_seat_filla_map)');
        }

        // Add the marker at the clicked location, and add the next-available label
        // from the array of alphabetical characters.
        var map = _instance.map;

        console.log(_instance.markers);


        function add() {
            var marker = new google.maps.Marker(markerOpts);
            var infowindow;

            if (markerOpts.content) {

                infowindow = new google.maps.InfoWindow({
                    content: markerOpts.content
                });

                marker.addListener('click', function() {
                    for (var i in Object.keys(_instance.markers)) {
                        if (_instance.markers[i] && _instance.markers[i].marker) {
                            _instance.markers[i].setAnimation(null);
                        }
                        if (_instance.markers[i] && _instance.markers[i].infowindow) {
                            _instance.markers[i].infowindow.close();
                        }
                    }

                    marker.infowindow = {
                        window: infowindow,
                        open: true
                    }

                    infowindow.open(map, marker);
                });
            }

            if (markerOpts.markerClickAnimation) {
                marker.addListener('click', function(event) {
                    if (marker.getAnimation() !== null) {
                        marker.setAnimation(null);
                    } else {
                        marker.setAnimation(google.maps.Animation.BOUNCE);
                    }
                });
            }

            if (markerOpts.onClickListeners) {
                if (Array.isArray(markerOpts.onClickListeners.markerListeners)) {
                    markerOpts.onClickListeners.markerListeners.forEach((element) => {
                        marker.addListener('click', element.bind(marker));
                    })
                }

                if (Array.isArray(markerOpts.onClickListeners.mapListeners)) {
                    markerOpts.onClickListeners.mapListeners.forEach((element) => {
                        map.addListener('click', element.bind(marker));
                    })
                }
            }

            return { marker: marker, infowindow: infowindow, data: markerOpts.data };
        }

        var marker = add();
        if (cb && typeof cb === 'function')
            cb(marker);

        const lat = markerOpts.position.lat;
        const lng = markerOpts.position.lng;
        console.log('Position: ' + JSON.stringify(markerOpts.position))
        _instance.markers[JSON.stringify(markerOpts.position)] = marker;
        console.log(_instance.markers);
        return marker;
    }

    function createMap(loc) {
        _instance.location = loc;

        var pos = {
            lat: _instance.location.coords.latitude,
            lng: _instance.location.coords.longitude
        };
        //Create a new map
        var map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: (options && options.zoom) || 2,
            center: pos
        });

        var line;

        google.maps.event.addListener(map, 'click', function(event) {
            _instance.addMarker({
                position: event.latLng,
                title: 'Some title',
                map: map,
                animation: google.maps.Animation.DROP,
                markerClickAnimation: google.maps.Animation.BOUNCE,
                draggable: true,
                icon: {
                    url: 'http://127.0.0.1:1337/images/g_maps_airport_icon.png',
                    // This marker is 20 pixels wide by 32 pixels high.
                    size: new google.maps.Size(32, 32),
                    // The origin for this image is (0, 0).
                    origin: new google.maps.Point(0, 0),
                    // The anchor for this image is the base of the airport icon at (0, 32).
                    anchor: new google.maps.Point(32 / 2, 32)
                },

                onClickListeners: {
                    mapListeners: [],
                    markerListeners: [
                        function onMarkerClicked(event) {
                            var from = {
                                latitude: _instance.location.coords.latitude,
                                longitude: _instance.location.coords.longitude,
                                lat: _instance.location.coords.latitude,
                                lng: _instance.location.coords.longitude
                            }
                            var to = {
                                latitude: event.latLng.lat(),
                                longitude: event.latLng.lng(),
                                lat: event.latLng.lat(),
                                lng: event.latLng.lng()
                            }
                            var result = geolocator.calcDistance({ from, to });
                            console.log(result);

                            if (line) line.setMap(null);

                            var planeSymbol = {
                                path: 'M362.985,430.724l-10.248,51.234l62.332,57.969l-3.293,26.145 l-71.345-23.599l-2.001,13.069l-2.057-13.529l-71.278,22.928l-5.762-23.984l64.097-59.271l-8.913-51.359l0.858-114.43 l-21.945-11.338l-189.358,88.76l-1.18-32.262l213.344-180.08l0.875-107.436l7.973-32.005l7.642-12.054l7.377-3.958l9.238,3.65 l6.367,14.925l7.369,30.363v106.375l211.592,182.082l-1.496,32.247l-188.479-90.61l-21.616,10.087l-0.094,115.684',
                                scale: 0.0393,
                                strokeOpacity: 1,
                                strokeColor: '#222',
                                strokeWeight: 1,
                                anchor: new google.maps.Point(300, 300)
                            }
                            line = _instance.createAnimatedLineSymbol({
                                path: [from, to],
                                icons: [{
                                    icon: planeSymbol,
                                    offset: '100%'
                                }],
                                strokeOpacity: 1,
                                strokeColor: '#544'
                            })
                            console.log(line);
                        }
                    ]
                },
                content: '<h1>Its an airport!</h1>'
            });
        });

        _instance.map = map;

        (function setUserPosition() {
            var infoWindow = new google.maps.InfoWindow({ map: map });
            map.setCenter(pos);
            infoWindow.setPosition(pos);
            infoWindow.setContent('Your location');
            _instance.addMarker({
                position: pos,
                title: 'You',
                label: 'Y',
                map: map,
                content: 'Your position',
                animation: google.maps.Animation.DROP,
                markerClickAnimation: google.maps.Animation.BOUNCE,
                draggable: true,
            });
        })();
    }

    if (!options || !options.coords) {
        (function init(cb) {
            geolocator.config({ language: 'en', google: { version: '3', key: 'AIzaSyDDBWrH7DuCZ8wNlOXgINCtI_gT9NkDRq4' } });
            defaultLoc = { coords: { longitude: 0, latitude: 0 } };
            if (options && options.useCache && typeof Storage !== "undefined" && sessionStorage.getItem('location')) {
                var location = JSON.parse(sessionStorage.getItem('location'));
                cb(location);
            } else {
                console.log('Could not find location in session storage');
                geolocator.locate(options, function(err, location) {
                    if (err) {
                        if (!navigator.geolocation) {
                            console.log('Error when locating position ' + err + '. Defaulting coordinates');
                            cb(defaultLoc);
                        } else {
                            navigator.geolocation.getCurrentPosition(function(position) {
                                cb(position);

                            }, function error() {
                                console.log('Error when using navigator geolocation');
                                cb(defaultLoc);
                            });
                        }
                    } else {
                        console.log('Creating map, used geolocator (uncached) to retrieve location ' + location);
                        if (options && options.useCache && typeof Storage !== "undefined" && location) {
                            sessionStorage.setItem('location', JSON.stringify(location));
                        }
                        cb(location);
                    }
                });
            }
        })(createMap);
    } else {
        createMap(options.coords);
    }

    return _instance;
}