module.exports = {
    respondWithXml(req,res){
        
        return res.ok({
            wantsXml: req.wantsXML,
            iam:{
                avery:'complex',
                object:{
                    but:'ishouldbe'
                },
                formated:['using','xml','otherwise'],
                thisTest:{
                    will:{
                        'ultimately':['fail']
                    }
                },
                that:['would',{not:'be',very:'good'}]
            },
            arr:['down','up','left','right'],
            heads:'shoulds',
            knees:'andToes'
        })
    },
     respondWithJson(req,res){
        return res.ok({
            iam:{
                avery:'complex',
                object:{
                    but:'ishouldbe'
                },
                formated:['using','xml','otherwise'],
                thisTest:{
                    will:{
                        'ultimately':['fail']
                    }
                },
                that:['would',{not:'be',very:'good'}]
            },
            arr:['down','up','left','right'],
            heads:'shoulds',
            knees:'andToes'
        })
    }
}