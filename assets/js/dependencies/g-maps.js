/*
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

    var x = {
        map: null,
        location: (function(options) {
            geolocator.config({ language: 'en', google: { version: '3', key: 'AIzaSyDDBWrH7DuCZ8wNlOXgINCtI_gT9NkDRq4' } });
            defaultLoc = { coords: { longitude: 0, latitude: 0 } };
            if (options && options.useCache && typeof Storage !== "undefined" && sessionStorage.getItem('location')) {
                var location = JSON.parse(sessionStorage.getItem('location'));
                return location;
            } else {
                console.log('Could not find location in session storage');
                geolocator.locate(options, function(err, location) {
                    if (err) {
                        if (!navigator.geolocation) {
                            console.log('Error when locating position ' + err + '. Defaulting coordinates');
                            return defaultLoc;
                        } else {
                            navigator.geolocation.getCurrentPosition(function(position) {
                                return position;

                            }, function error() {
                                console.log('Error when using navigator geolocation');
                                return defaultLoc;
                            });
                        }
                    } else {
                        console.log('Creating map, used geolocator (uncached) to retrieve location ' + location);
                        if (options && options.useCache && typeof Storage !== "undefined" && location) {
                            sessionStorage.setItem('location', JSON.stringify(location));
                        }
                        return location;
                    }
                });
            }
        })(options),

        configure: function(options) {
            const _map = this;
            _map.map = (function(location) {
                var pos = {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                };
                //Create a new map
                var map = new google.maps.Map(document.getElementById('map-canvas'), {
                    zoom: (options && options.zoom) || 2,
                    center: (options && options.coords) || pos
                });

                google.maps.event.addListener(map, 'click', function(event) {
                    _map.addMarker(event.latLng, 'Some title', 'Airport', 'Content');
                });

                var infoWindow = new google.maps.InfoWindow({ map: map });
                map.setCenter(pos);
                infoWindow.setPosition(pos);
                infoWindow.setContent('Your location');
                return map;
            })(options || this.location || this.geoLocate());
        },

        addMarker: function(location, title, markerSymbol, contentInfo) {
            // Add the marker at the clicked location, and add the next-available label
            // from the array of alphabetical characters.
            var map = this.map;

            var marker = new google.maps.Marker({
                position: location,
                label: markerSymbol,
                title: title,
                map: map,
                animation: google.maps.Animation.DROP,
                draggable: true,

            });

            marker.addListener('click', function() {
                var infowindow = new google.maps.InfoWindow({
                    content: contentInfo
                });
                infowindow.open(map, marker);
            });

            marker.addListener(marker, 'click', function(event) {
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                } else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                }
            });
        }
    }
    return x;
}