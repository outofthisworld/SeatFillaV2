module.exports = function(user, path) {
    var req = this.req;
    var res = this.res;
    var sails = req._sails;

    if (!user) res.redirect('/')
    if (!path) res.redirect('/userprofile/' + user.username);
    res.redirect(path.replace(':username', req.user.username));
}