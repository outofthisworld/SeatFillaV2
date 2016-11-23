/*
    Locates a user via HTML5 navigator, or fallbacks to I.P.

    Then attempts to use session storage, cookies or fallback to server to store location.

    Created by Dale.
*/

$(document).ready(function() {
    (function tryLocate() {
        window.seatfilla.globals.geolocation.getUserLocation(function(status, result) {
            if (status != 200 || !result) {
                geolocator.config({
                    language: 'en',
                    google: {
                        version: '3',
                        key: 'AIzaSyDDBWrH7DuCZ8wNlOXgINCtI_gT9NkDRq4'
                    }
                })

                function setUserLocation(callback) {
                    geolocator.locate({
                        enableHighAccuracy: true,
                        timeout: 6000,
                        maximumAge: 0,
                        desiredAccuracy: 30,
                        fallbackToIP: true,
                        addressLookup: true,
                        timezone: true
                    }, function(err, location) {
                        console.log('Located user : ' + JSON.stringify(location))

                        if (err || !location) {
                            return callback(err, null)
                        } else {
                            console.log('Setting user location')
                            window.seatfilla.globals.geolocation.setUserLocation(location, function(status) {
                                if (status == 200) {
                                    return callback(null, location)
                                } else {
                                    return callback(new Error('Status was not 200 but ' + status), null)
                                }
                            })
                        }
                    })
                }
                setTimeout(function() {
                    if ((function() {
                            return setUserLocation(function(err, location) {
                                if (err) {
                                    console.log(err)
                                    return false
                                } else {
                                    return true;
                                }
                            })
                        })()) {
                        console.log('Set user location')
                    } else {
                        console.log('Failed to set user location')
                    }
                }, 500)
            } else {
                console.log('Retrieved user loc from cache: ')
                console.log(result)
            }
        })
    })()
})