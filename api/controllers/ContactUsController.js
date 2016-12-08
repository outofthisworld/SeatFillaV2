
const _create = require('../out/create')

module.exports = {
    create(req,res){
        _create(req,res).then(function(created){
            req.flash('info','Thank you for contacting us, we will get back to you shortly.');
            req.redirect('back')
        }).catch(function(err){
            sails.log.error(err);
            req.flash('warning','Sorry, something went wrong storing these details!');
            res.redirect('back')
        })
    }
}