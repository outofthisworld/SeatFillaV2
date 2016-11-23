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

var _seat_filla_map = function(options) {

    var _instance = {};
    _instance.map = null;
    _instance.markers = {};


    //Creates a new Polygon line on the map
    _instance.createLine = function(options) {
        if (!options) throw new Error('Invalid params passed to createLine');

        options.map = _instance.map;
        var line = new google.maps.Polyline(options);

        return line;
    }

    _instance.isGeoLocatedPosition = function(pos) {
        return pos.lat == _instance.pos.lat && pos.lng == _instance.pos.lng;
    }

    //Removes a marker from the map and returns the data associated with it
    _instance.removeMarker = function(latLng) {
        if (!latLng) throw new Error('Invalid params');

        console.log(_instance.markers);
        const json = JSON.stringify(latLng);
        console.log(json);

        if (_instance.pos && (latLng.lat == _instance.pos.lat && latLng.lng == _instance.pos.lng))
            delete _instance.pos;

        if (!_instance.markers || !_instance.markers[json]) {
            console.log('Could not find marker to remove');
            return;
        };

        _instance.markers[json].infowindow.close();
        _instance.markers[json].marker.setMap(null);
        const data = _instance.markers[json].data;
        delete _instance.markers[json];
        console.log('removed');
        return data;
    }

    _instance.removeAllMarkers = function() {
        Object.keys(_instance.markers).forEach(function(key) {
            console.log(key);
            const marker = _instance.markers[key];
            console.log(marker);
            if (marker && marker.marker && marker.marker.data) {
                const pos = {
                    lng: marker.data.Longitude,
                    lat: marker.data.Latitude,
                }

                if (!_instance.isGeoLocatedPosition(pos)) {
                    console.log('removing marker');
                    _instance.removeMarker(pos);
                }
            }
        });
    }

    //Removes the geolocated position from the map, if it exists
    _instance.removeGeoLocatedPosition = function() {
        if (!_instance.pos) return;

        const json = JSON.stringify(_instance.pos);
        if (_instance.markers[json]) {
            _instance.markers[json].marker.setMap(null);
            _instance.markers[json].infowindow.setMap(null);
            delete _instance.markers[json];
            delete _instance.pos;
        }
    }

    //Sets a position on the map
    _instance.setGeoLocatedPosition = function(options) {

        _instance.removeGeoLocatedPosition();
        _instance.pos = options.pos;

        if (options.infowindow) {
            var infoWindow = new google.maps.InfoWindow({
                map: _instance.map
            });
            infoWindow.setPosition(options.pos);
            infoWindow.setContent(options.infoWindowContent);
        }

        if (options.centerMap) {
            _instance.map.setCenter(options.pos);
        }

        _instance.addMarker(options.marker);
    }

    //Hides all markers from the map
    _instance.hideAllMarkers = function() {
        _instance.markers.forEach(function(marker) {
            marker.marker.setMap(null);
        });
    }

    //Shows all markers
    _instance.showAllMarkers = function() {
        _instance.markers.forEach(function(marker) {
            marker.marker.setMap(_instance.map);
        });
    }

    //Creates an animated line symbol
    _instance.createAnimatedLineSymbol = function(options) {
        if (!options) throw new Error('Invalid params passed to createLine');

        var line = _instance.createLine(options);
        _instance.animateLineSymbols(line, options.interval);

        return line;
    }

    //Adds a legend to the map
    _instance.addLegend = function(element, position) {
        _instance.map.controls[position || google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
    }

    //Default animation for a polygon line
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

    //Retrieves a marker using a latLng json encoded string
    _instance.getMarkerJsonString = function(latLngString) {
        return _instance.markers[latLngString];
    }

    //Retrieves a marker using a latLng object
    _instance.getMarker = function(latLng) {
        return _instance.markers[JSON.stringify(latLng)];
    }

    //Adds a click listener to the map
    _instance.addMapClickListener = function(handler) {
        google.maps.event.addListener(_instance.map, 'click', handler);
    }

    //Adds a marker to the map
    _instance.addMarker = function(markerOpts, cb) {
        if (!markerOpts) {
            throw new Error('Invalid args passed to addMarker (_seat_filla_map)');
        }

        var map = _instance.map;

        function add() {
            var marker = new google.maps.Marker(markerOpts);
            var infowindow;

            if (markerOpts.content) {

                infowindow = new google.maps.InfoWindow({
                    content: markerOpts.content
                });

                marker.addListener('click', function() {
                    marker.infowindow = {
                        window: infowindow,
                        open: true
                    }

                    infowindow.open(map, marker);
                });
            }

            const obj = {
                marker: marker,
                infowindow: infowindow,
                data: markerOpts.data
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
                        marker.addListener('click', element.bind(obj));
                    })
                }

                if (Array.isArray(markerOpts.onClickListeners.mapListeners)) {
                    markerOpts.onClickListeners.mapListeners.forEach((element) => {
                        map.addListener('click', element.bind(obj));
                    })
                }
            }

            return obj;
        }

        var marker = add();
        if (cb && typeof cb === 'function')
            cb(marker);

        const lat = markerOpts.position.lat;
        const lng = markerOpts.position.lng;

        _instance.markers[JSON.stringify(markerOpts.position)] = marker;
        return marker;
    }

    //Creates the map
    function createMap(loc) {
        _instance.location = loc;
        _instance.pos = {
            lat: _instance.location.coords.latitude,
            lng: _instance.location.coords.longitude
        };

        //Create a new map
        var map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: (options && options.zoom) || 2,
            center: _instance.pos,
            mapTypeId: (options && options.mapTypeId),

        });

        _instance.map = map;
        _instance.setGeoLocatedPosition({
            pos: _instance.pos,
            infowindow: true,
            infoWindowContent: 'Your position',
            centerMap: true,
            marker: {
                position: _instance.pos,
                title: 'You',
                label: 'Y',
                map: _instance.map,
                content: 'Your position',
                animation: google.maps.Animation.DROP,
                markerClickAnimation: google.maps.Animation.BOUNCE,
                draggable: true,
                onClickListeners: {
                    markerListeners: options.markerListeners

                }
            }
        });
    }

    //Performs geo location
    if (!options || !options.coords) {
        (function init(cb) {
            geolocator.config({
                language: 'en',
                google: {
                    version: '3',
                    key: 'AIzaSyDDBWrH7DuCZ8wNlOXgINCtI_gT9NkDRq4'
                }
            });
            defaultLoc = {
                coords: {
                    longitude: 0,
                    latitude: 0
                }
            };
            window.seatfilla.globals.geolocation.getUserLocation(function(status, result) {
                if (status != 200 || !result) {
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
                            window.seatfilla.globals.geolocation.setUserLocation(location, function(status) {
                                cb(location);
                                if (status != 200) {
                                    console.log('Error setting user location..');
                                }
                            });
                        }
                    });
                } else {
                    cb(result);
                }
            });
        })(createMap);
    } else {
        createMap(options.coords);
    }

    return _instance;
}