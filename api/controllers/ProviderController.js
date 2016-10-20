module.exports = {
    index(req,res){
        return res.ok({ user: req.user}, {
            view: 'provider-dashboard/index',
            layout: 'layouts/provider-layout'
        });
    },
    login(req,res){
         return res.ok({ user: req.user}, {
            view: 'provider-dashboard/login',
            layout: 'layouts/provider-layout'
        });
    }
}