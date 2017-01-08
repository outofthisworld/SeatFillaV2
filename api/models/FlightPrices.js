module.exports = {
  attributes: {
    id: {
      primaryKey: true,
      type: 'string',
      defaultsTo: function () {
        return require('node-uuid').v4()
      }
    },
    agent: {
      type: 'string'
    },
    bookingUrl: {
      type: 'string'
    },
    price: {
      type: 'string'
    }
  }
}
