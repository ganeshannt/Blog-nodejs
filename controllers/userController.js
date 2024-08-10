const User = require('../models/User')
const Post = require('../models/Post')
const Follow = require('../models/Follow')
const jwt = require('jsonwebtoken')

exports.doesUsernameExist = function (req, res) {
  User.findByUsername(req.body.username)
    .then(() => {
      res.json(true)
    })
    .catch(() => {
      res.json(false)
    })
}

exports.doesEmailExist = async function (req, res) {
  let emailExistance = await User.findByEmail(req.body.email)
  res.json(emailExistance)
}

exports.signup = function (req, res) {
  let user = new User(req.body)
  user
    .signup()
    .then(() => {
      req.session.user = {
        username: user.data.username,
        avatar: user.avatar,
        _id: user.data._id
      }
      req.session.save(function () {
        res.redirect('/')
      })
    })
    .catch(regErrors => {
      regErrors.forEach(function (error) {
        req.flash('regErrors', error)
      })
      req.session.save(function () {
        res.redirect('/')
      })
    })
}

// Login check to access the page
exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next()
  } else {
    req.flash('user must be logged into access this page')
    req.session.save(function () {
      res.redirect('/')
    })
  }
}

// Login check via API token
exports.apiMustBeLoggedIn = function (req, res, next) {
  try {
    req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET)
    next()
  } catch {
    res.json('Invalid token')
  }
}

exports.login = function (req, res) {
  let user = new User(req.body)
  user
    .login()
    .then(function (result) {
      req.session.user = {
        avatar: user.avatar,
        username: user.data.username,
        _id: user.data._id
      }
      req.session.save(function () {
        res.redirect('/')
      })
    })
    .catch(function (err) {
      req.flash('error', err)
      req.session.save(function () {
        res.redirect('/')
      })
    })
}

// login via API
exports.apiLogin = function (req, res) {
  let user = new User(req.body)
  user
    .login()
    .then(function (result) {
      res.json(
        jwt.sign({ _id: user.data._id }, process.env.JWTSECRET, {
          expiresIn: '7d'
        })
      )
    })
    .catch(function (err) {
      res.json('Invalid username or password')
    })
}

exports.signout = function (req, res) {
  req.session.destroy(function () {
    res.redirect('/')
  })
}

exports.home = async function (req, res) {
  let visitorCount = await User.visiterCount()
  console.log('from home screen', visitorCount)
  if (req.session.user) {
    let posts = await Post.getFeed(req.session.user._id)
    res.render('home-dashboard', { posts: posts })
  } else {
    res.render('home-guest', {
      visitorCount: visitorCount,
      regErrors: req.flash('regErrors')
    })
  }
}

// get post by author via API

exports.apiGetPostByUsername = async function (req, res) {
  try {
    let authorDoc = await User.findByUsername(req.params.username)
    let posts = await Post.findByAuthorId(authorDoc._id)
    res.json(posts)
  } catch (error) {
    res.json('Invalid user request')
  }
}

exports.ifUserExists = function (req, res, next) {
  User.findByUsername(req.params.username)
    .then(function (userDoc) {
      req.profileUser = userDoc
      next()
    })
    .catch(function () {
      res.render('404')
    })
}

//  follow and stop follow property
exports.sharedProfileData = async function (req, res, next) {
  let isFollowing = false
  let isVisitorProfile = false
  if (req.session.user) {
    isFollowing = await Follow.isVisitorIdFollowing(
      req.profileUser._id,
      req.visitorId
    )
    isVisitorProfile = req.profileUser._id.equals(req.session.user._id)
  }
  req.isVisitorProfile = isVisitorProfile
  req.isFollowing = isFollowing
  // retrieve post , followers, following count
  // did not used await bcoz each function are independent one another
  let countPostPromise = Post.countPostByAuthor(req.profileUser._id)
  let countFollowerPromise = Follow.countFollowerByAuthor(req.profileUser._id)
  let countFollowingPromise = Follow.countFollowingByAuthor(req.profileUser._id)

  let [postCount, followersCount, followingCount] = await Promise.all([
    countPostPromise,
    countFollowerPromise,
    countFollowingPromise
  ])
  req.postCount = postCount
  req.followersCount = followersCount
  req.followingCount = followingCount
  next()
}

exports.profilePostScreen = function (req, res, next) {
  //  ask our post model post by  certain author id
  Post.findByAuthorId(req.profileUser._id)
    .then(function (posts) {
      res.render('profile', {
        currentPage: 'posts',
        posts: posts,
        profileUsername: req.profileUser.username,
        profileAvatar: req.profileUser.avatar,
        isFollowing: req.isFollowing,
        isVisitorProfile: req.isVisitorProfile,
        counts: {
          postCount: req.postCount,
          followerCount: req.followersCount,
          followingCount: req.followingCount
        }
      })
    })
    .catch(function () {
      res.render('404')
    })
}

exports.profileFollowersScreen = async function (req, res) {
  try {
    console.log('controller :', req.profileUser._id)
    let followers = await Follow.getFollowersById(req.profileUser._id)
    res.render('profile-followers', {
      currentPage: 'followers',
      followers: followers,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorProfile: req.isVisitorProfile,
      counts: {
        postCount: req.postCount,
        followerCount: req.followersCount,
        followingCount: req.followingCount
      }
    })
  } catch {
    res.render('404')
  }
}

exports.profileFollowingScreen = async function (req, res) {
  try {
    console.log('controller :', req.profileUser._id)
    let following = await Follow.getFollowingById(req.profileUser._id)
    res.render('profile-following', {
      currentPage: 'following',
      followings: following,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorProfile: req.isVisitorProfile,
      counts: {
        postCount: req.postCount,
        followerCount: req.followersCount,
        followingCount: req.followingCount
      }
    })
  } catch {
    res.render('404')
  }
}
