const User = require('../models/User')



exports.home = function(req,res){
    res.render('home-guest')
}

exports.signup = function(req,res){
    // console.log(req.body)
    let user = new User(req.body)
    user.signup()
    if (user.error.length) {
        res.send(user.error)
    }
    else{
        res.send('congrats ... no error found')
    }
    res.send("signup")
}