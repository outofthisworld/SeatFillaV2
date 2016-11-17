(function () {
  function hookSelect2 () {
    $('select:not(.noselect)').select2()

    $('select.city:not(.noselect)').select2({
      placeholder: 'Select a city',
      allowClear: false
    })

    $('select.country:not(.noselect)').select2({
      placeholder: 'Select a city',
      allowClear: false
    })

    $('select.airport:not(.noselect)').select2({
      placeholder: 'Select an airport',
      allowClear: false
    })
  }

  function hookCountrySelects () {
    const geoData = window.seatfilla.globals.geolocation.retrieveCountryData()
    geoData.forEach(function (country,countryIndx) {
      $('select.country').append(
        $('<option></option>', {
          value: country.countryName,
          text: country.countryName,
          'data-attr-continentIndex': country.continentIndex,
          'data-attr-countryIndex': country.countryIndex,
          'data-attr-continentId': country.continentId,
          'data-attr-continentName': country.continentName,
          'data-attr-countryCode': country.countryId,
          'data-attr-currency:': country.currency
        })
      )
    })
  }

  function hookCitySelect(){
    const geoData = window.seatfilla.globals.inputs.data.retrieveCityData();
    geoData.forEach(function(city,indx){
       $('select.city').append($('<option></option>', {
          value: city.name,
          text: city.name,
          'data-attr-countryId': city.countryId,
          'data-attr-location': city.location,
          'data-attr-iataCode': city.iataCode,
          'data-attr-id:': city.id,
          'data-attr-currency':city.currency,
          'data-attr-cityIndex': city.cityIndex,
          'data-attr-countryIndex': city.countryIndex,
          'data-attr-continentIndex': city.continentIndex,
        }))
    })
  }

  function attachCountrySelect () {
    $('select.country').on('change', function () {
      console.log('change')
      const $this = $(this)
      $($this.attr('data-attr-cityLink')).html('')
      $($this.attr('data-attr-airportLink')).html('')
      const $cityLink = $($this.attr('data-attr-cityLink'));
      console.log($this.attr('data-attr-cityLink'));
      const $selected = $this.find('option:selected')
      const continentIndex = $selected.attr('data-attr-continentIndex')
      const countryIndex = $selected.attr('data-attr-countryIndex')
      const data = window.seatfilla.globals.retrieveGeoData()
      for (key in data
          .Continents[continentIndex]
          .Countries[countryIndex].Cities) {
        const countryId = data.Continents[continentIndex].Countries[countryIndex].Cities[key]['CountryId']
        const location = data.Continents[continentIndex].Countries[countryIndex].Cities[key]['Location']
        const iataCode = data.Continents[continentIndex].Countries[countryIndex].Cities[key]['IataCode']
        const id = data.Continents[continentIndex].Countries[countryIndex].Cities[key]['Id']
        const name = data.Continents[continentIndex].Countries[countryIndex].Cities[key]['Name']
        $cityLink.append($('<option></option>', {
          value: name,
          text: name,
          'data-attr-countryId': countryId,
          'data-attr-location': location,
          'data-attr-iataCode': iataCode,
          'data-attr-id:': id,
          'data-attr-cityIndex': key,
          'data-attr-countryIndex': countryIndex,
          'data-attr-continentIndex': continentIndex,
          'data-attr-airportLink': $this.attr('data-attr-airportLink')
        }))
      }
    })
  }

  function attachCitySelect () {
    $('select.city').on('change', function () {
      // Find selected city option
      const selectedOption = $(this).find('option:selected')
      // Clear airports
      $(selectedOption.attr('data-attr-airportLink')).html('')
      const continentIndex = selectedOption.attr('data-attr-continentIndex')
      const countryIndex = selectedOption.attr('data-attr-countryIndex')
      const cityIndex = selectedOption.attr('data-attr-cityIndex')
      const geoData = window.seatfilla.globals.retrieveGeoData()
      for (key in geoData.Continents[continentIndex].Countries[countryIndex].Cities[cityIndex].Airports) {
        $(selectedOption.attr('data-attr-airportLink')).append(
          $('<option></option>',
            {
              text: geoData.Continents[continentIndex].Countries[countryIndex].Cities[cityIndex].Airports[key].Name,
              value: geoData.Continents[continentIndex].Countries[countryIndex].Cities[cityIndex].Airports[key].id,
              'data-attr-cityId': geoData.Continents[continentIndex].Countries[countryIndex].Cities[cityIndex].Airports[key].CityId,
              'data-attr-countryId': geoData.Continents[continentIndex].Countries[countryIndex].Cities[cityIndex].Airports[key].CountryId,
              'data-attr-location': geoData.Continents[continentIndex].Countries[countryIndex].Cities[cityIndex].Airports[key].Location
            })
        )
      }
    })
  }

  function attachDomEventListeners () {
    attachCountrySelect()
    attachCitySelect()
  }

  function init () {
    Promise.all([
      new Promise(function (resolve, reject) {
        resolve(hookSelect2())
      }),
      new Promise(function (resolve, reject) {
        hookCitySelect();
        resolve(hookCountrySelects())
      }),
      new Promise(function (resolve, reject) {
        resolve(attachDomEventListeners())
      })
    ]).catch(function (err) {console.log(err)})
  }

  $(document).ready(init)
})()
