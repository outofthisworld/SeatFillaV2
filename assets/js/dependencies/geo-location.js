/*
    Locates a user via HTML5 navigator, or fallbacks to I.P.

    Then attempts to use session storage, cookies or fallback to server to store location.

    Created by Dale.
*/

$(document).ready(function () {
  (function tryLocate () {
    window.seatfilla.globals.geolocation.getUserLocation(function (status, result) {
      if (status != 200 || !result) {
        geolocator.config({ language: 'en', google: { version: '3', key: 'AIzaSyDDBWrH7DuCZ8wNlOXgINCtI_gT9NkDRq4' } })
        defaultLoc = { coords: { longitude: 0, latitude: 0 } }

        geolocator.locate({
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 0,
          desiredAccuracy: 30,
          fallbackToIP: true,
          addressLookup: true,
          timezone: true
        }, function (err, location) {
          console.log('Located user : ' + JSON.stringify(location))

          function setLoc (pos) {
            console.log('Setting user location');

            window.seatfilla.globals.geolocation.setUserLocation(pos, function (status) {
              if (status == 200) {
                console.log('Succesfully stored user location in seatfilla cache')
              } else {
                console.log('Could not store user location in seatfilla cache')
              }
            })

          }

          if (err) {
            if (!navigator.geolocation) {
              console.log('Cannot locate position using HTML5 navigator')
              return
            } else {
              navigator.geolocation.getCurrentPosition(function (position) {
                setLoc(location)
              }, function error () {
                console.log('Error when using navigator geolocation')
              })
            }
          } else {
            setLoc(location)
          }
        })
      } else {
        console.log('Retrieve user loc from cache: ');
        console.log(result)
      }
    })
  })()
})
