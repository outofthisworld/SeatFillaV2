$(document).ready(function () {
  (function retrieveCurrencies () {
    const displayCurrencies = function (object, selectedOption) {
      object.Currencies.forEach(function (result) {
        const option = $('<option></option>').attr('value', result.Code)
          .attr('data-symbol', result.Symbol).text(result.Code + ' (' + result.Symbol + ')')

        if (result.Code === (selectedOption || 'USD')) {
          option.attr('selected', 'selected')
        }

        $('#seatfilla_currencies').append(option)
      })
    }

    window.seatfilla.globals.cache.get({
      key: 'sf-currencies',
      success: function (status, result) {
        function display (data) {
          window.seatfilla.globals.locale.getPrefferedCurrency(function (status, result) {
            console.log('Status was: ' + status + ' Retrieve preffered currency ' + JSON.stringify(result))
            if (status != 200 || !result) {
              displayCurrencies(data, 'USD')
            } else {
              displayCurrencies(data, result)
            }
          })
        }

        if (status == 200 && result) {
          display(result)
          return
        }

        const type = window.seatfilla.globals.site.endpoints.lookupservice.getCurrencyCodes.method
        const url = window.seatfilla.globals.site.endpoints.lookupservice.getCurrencyCodes.url
        $.ajax({
          type,
          url,
          success: function (response, textstatus, xhr) {
            response = JSON.parse(response)
            console.log(response)
            if (xhr.status == 200) {
              window.seatfilla.globals.cache.put({
                key: 'sf-currencies',
                data: response,
                success: function () {},
                useServerStore: false
              })
              display(response)
            } else {
              console.log('Could not load currencies')
              $('#seatfilla_currencies').remove()
            }
          }
        })
      }
    })

    $('#seatfilla_currencies').on('change', function () {
      console.log('trigger sf currency change');


      const currencyCodePreference = $(this).val()

      window.seatfilla.globals.locale.setPrefferedCurrency(currencyCodePreference, function (status) {
        if (status == 200) {
          console.log('Succesfully updated user currency code preference')
        } else {
          console.log('Error updating user currency code preference')
        }
      })
      $('span[data-attr-price]').each(function () {
        var $this = $(this)

        var newCurrencyCode = $('#seatfilla_currencies').val()
        var newCurrencySymbol = $('#seatfilla_currencies').attr('data-symbol')

        var $currencyCode = $this.find('span[data-attr-currency-code]')
        var $amount = $this.find('span[data-attr-amount]')
        var $currencySymbol = $this.find('span[data-attr-currency-symbol]')

        if (!$currencyCode || !$amount || !$currencySymbol) {throw new Error('Invalid price format')}

        var currencyCode = $currencyCode.attr('data-attr-currency-code')
        var amount = $amount.attr('data-attr-amount')
        var currencySymbol = $currencySymbol.attr('data-attr-currency-symbol')

        if (newCurrencyCode == currencyCode) return

        window.seatfilla.globals.getFixerIoExchangeRates(currencyCode, function (err, exchangeRates) {
          if (err) {
            alert('Error ' + err)
            return
          }

          if (!exchangeRates) {
            alert('Error: returned exchange rates were undefined')
            return
          }

          if (!(newCurrencyCode in exchangeRates.rates)) {
            return
          }

          var newAmount = parseFloat(amount) * parseFloat(exchangeRates.rates[newCurrencyCode])


          $currencyCode.attr('data-attr-currency-code', newCurrencyCode)
          $currencySymbol.attr('data-attr-currency-symbol', newCurrencySymbol)
          $amount.attr('data-attr-amount', newAmount)
          $currencyCode.text(newCurrencyCode)
          $currencySymbol.text(newCurrencySymbol)
          $amount.text(newAmount.toFixed(2))
        })

        $('span[data-attr-currency-code]').attr('data-attr-currency-code',newCurrencyCode);
        $('span[data-attr-currency-code]').text(newCurrencyCode);
        $('span[data-attr-currency-symbol]').attr('data-attr-currency-symbol',newCurrencySymbol);
        $('span[data-attr-currency-symbol]').text(newCurrencySymbol);
      })
    })
  })()
})
