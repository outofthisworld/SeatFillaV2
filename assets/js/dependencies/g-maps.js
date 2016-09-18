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

    _instance.addLegend = function(element, position) {
        _instance.map.controls[position || google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
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

    _instance.getMarkerJsonString = function(latLngString) {
        return _instance.markers[latLngString];
    }

    _instance.getMarker = function(latLng) {
        return _instance.markers[JSON.stringify(latLng)];
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
                    /*for (var i in Object.keys(_instance.markers)) {
                        if (_instance.markers[i] && _instance.markers[i].marker) {
                            _instance.markers[i].setAnimation(null);
                        }
                        if (_instance.markers[i] && _instance.markers[i].infowindow) {
                            _instance.markers[i].infowindow.close();
                        }
                    }*/

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
            center: pos,
            mapTypeId: (options && options.mapTypeId),

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