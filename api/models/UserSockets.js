module.exports = {
  autoPK: false,
  attributes: {
    id: {
      primaryKey: true,
      type: 'string',
      defaultsTo: function () {
        return require('node-uuid').v4()
      }
    },
    user: {
      model: 'user',
      via: 'id',
      notNull: true
    },
    socketId: {
      type: 'integer',
      notNull: true,
      required: true
    }
  }
}
