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


    const executableQueue = [];

    _instance.addMarker = function(options, cb) {

        if (!options) {
            throw new Error('Invalid args passed to addMarker (_seat_filla_map)');
        }

        // Add the marker at the clicked location, and add the next-available label
        // from the array of alphabetical characters.
        var map = _instance.map;


        function add() {
            var marker = new google.maps.Marker(options);

            if (options.content) {
                marker.addListener('click', function() {
                    var infowindow = new google.maps.InfoWindow({
                        content: options.content
                    });

                    marker.infowindow = {
                        window: infowindow,
                        open: true
                    }

                    infowindow.open(map, marker);
                });
            }

            if (options.markerClickAnimation) {
                marker.addListener('click', function(event) {
                    if (marker.getAnimation() !== null) {
                        marker.setAnimation(null);
                    } else {
                        marker.setAnimation(google.maps.Animation.BOUNCE);
                    }
                });
            }

            if (options.onClickListeners) {
                if (Array.isArray(options.onClickListeners.markerListeners)) {
                    options.onClickListeners.markerListeners.forEach((element) => {
                        marker.addListener('click', element.bind(marker));
                    })
                }

                if (Array.isArray(options.onClickListeners.mapListeners)) {
                    options.onClickListeners.mapListeners.forEach((element) => {
                        map.addListener('click', element.bind(marker));
                    })
                }
            }

            return marker;
        }

        if (map) {
            executableQueue.forEach((exec) => {
                exec.cb.call(this, exec.options);
            });
            add();
        } else {
            executableQueue.push({ cb: add, options: options });
        }

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
            center: (options && options.coords) || pos
        });

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
                            console.log({
                                latitude: _instance.location.coords.latitude,
                                longitude: _instance.location.coords.longitude
                            });
                            console.log(event.latLng.lat());
                            console.log(event.latLng.lng());
                            var result = geolocator.calcDistance({
                                from: {
                                    latitude: _instance.location.coords.latitude,
                                    longitude: _instance.location.coords.longitude
                                },
                                to: {
                                    latitude: event.latLng.lat(),
                                    longitude: event.latLng.lng()
                                },

                            });
                            console.log(result);
                        }
                    ]
                },
                content: '<h1>Its an airport!</h1>'
            });
        });

        _instance.map = map;
    }


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

    return _instance;
}