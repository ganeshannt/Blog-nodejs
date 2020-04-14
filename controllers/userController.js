const User = require('../models/User')



exports.signup = function(req,res){
    let user = new User(req.body)
    user.signup().then(() => {
      req.session.user = {username: user.data.username,avatar:user.avatar,_id:user.data._id}
      req.session.save(function() {
        res.redirect('/')
      })
    }).catch((regErrors) => {
      regErrors.forEach(function(error) {
        req.flash('regErrors', error)
      })
      req.session.save(function() {
        res.redirect('/')
      })
    })
  }




// Login check to access the page 
exports.mustBeLoggedIn = function(req,res,next){
  if(req.session.user){
    next()
  }else{
    req.flash("user must be logged into access this page")
    req.session.save(function(){
      res.redirect('/')
    })
  }
}






exports.login = function(req,res){
    let user = new User(req.body)
    user.login()
    .then(function(result){
        req.session.user = {avatar:user.avatar, username : user.data.username, _id : user.data._id}
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
        res.render('home-dashboard')      
    } else {
        res.render('home-guest',{ error : req.flash('error'), regErrors: req.flash('regErrors')})
    }
}

exports.ifUserExists = function(req,res,next){
  User.findByUsername(req.params.username).then(function(userDoc){
    req.profileUser = userDoc
    next()
  }).catch(function(){
    res.render("404")
  })
}

exports.profilePostScreen = function(req,res,next){
  res.render('profile',{
    profileUsername:req.profileUser.username,
    profileAvatar: req.profileUser.avatar
  })
}