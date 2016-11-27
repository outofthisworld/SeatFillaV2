module.exports = {
  attributes:{
      checkInDate:{
        type:'datetime'
      },
      checkOutDate:{
        type:'datetime'
      },
      numberOfRooms: {
        type:'integer'
      },
      numberOfGuests:{
        type:'integer'
      },
      currency: {
        type:'string'
      },
      countryCode: {
        type:'string'
      },
      locale: {
        type:'string'
      },
      hotels:{
        collection:'hotel',
        via:'hotelQueries'
      }
  }
}
