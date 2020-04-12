const User = require('../models/User')



exports.signup = function(req,res){
    // console.log(req.body)
    let user = new User(req.body)
    user.signup()
    if (user.error.length) {
        user.error.forEach(function(err){
            req.flash('regerror',err)
        })
        req.session.save(function(){
            res.redirect('/')
        })
    }
    else{
        res.send('congrats ... no error found')
    }
    res.send("signup")
}



exports.login = function(req,res){
    let user = new User(req.body)
    user.login()
    .then(function(result){
        req.session.user = {favColor : "blue", username : user.data.username}
        req.session.save(function(){
            res.redirect('/')
        })
    })
    .catch(function(err){
        req.flash('error',err)
        req.session.save(function(){
            res.redirect('/')
        })
    })
    
}


exports.signout = function(req,res){
    req.session.destroy(function(){
        res.redirect('/')
    })
}


exports.home = function(req, res){
    if (req.session.user) {
        res.render('home-dashboard',{username : req.session.user.username})      
    } else {
        res.render('home-guest',{ error : req.flash('error')},{regerror : req.flash('regerror')})
    }
}
