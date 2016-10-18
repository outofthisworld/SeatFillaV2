module.exports = {
  subscribe(userId, socketId) {
    return UserSocket.create({
      user: userId,
    socketId})
  },
  find(ids) {
    if (!(_.isArray(ids))) throw new Error('Invlaid params specified to UserSocketService.js/find')
    return UserSocket.find({
      or: [
        {
          user: ids
        },
        {
          socketId: ids
        }
      ]
    })
  },
  findAll() {
    return UserSocket.find()
  },
  unsubscribe(id) {
    return UserSocket.destroy({
      or: [
        {
          user: id
        },
        {
          socket: id
        }
      ]
    })
  }
}
