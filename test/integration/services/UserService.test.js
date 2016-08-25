describe('User service tests', function () {
  describe('- create and remove users', function () {
    it('creates a user', function (done) {
      const req = {
        allParams: function () {
          return {
            id: 1234,
            username: 'TestUser123',
            password: 'testpassword',
            passwordConfirmation: 'testpassword',
            birthDay: '24',
            birthMonth: '11',
            birthYear: '1993',
            provider: 'local',
            firstName: 'Dale',
            lastName: 'Stephen',
            middleName: 'Appleby',
            email: 'test@seatfilla.com',
            isLockedOut: false,
            isEmailVerified: false,
            ip: '127.0.0.1'
          }
        },
        headers: {
          'user-agent': 'headless SfClient/OSX v.20'
        }
      }

      UserService.createUser(req).then(function (user) {
        return user.id
      }).then(function (id) {
        User.find(id).exec(function (err, user) {
          if (err) return done(err)
          else if (user) return done()
        })
      }).catch(function (err) {
        return done(err)
      })
    })

    it('deletes the created user', function (done) {
      UserService.deleteUser(1234).then(function (result) {
        return done()
      }).catch(function (err) {
        return done(err)
      })
    })
  })
})
