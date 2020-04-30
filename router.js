const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postcontroller')
const followController = require('./controllers/followController')




//Home
router.get('/', userController.home)


//USER
router.post('/signup', userController.signup)
router.post('/login', userController.login)
router.post('/signout', userController.signout)
router.post('/doesUsernameExist',userController.doesUsernameExist)
router.post('/doesEmailExist',userController.doesEmailExist)

// Profile
router.get('/profile/:username', userController.ifUserExists,userController.sharedProfileData, userController.profilePostScreen)
router.get('/profile/:username/followers', userController.ifUserExists,userController.sharedProfileData, userController.profileFollowersScreen)
router.get('/profile/:username/following', userController.ifUserExists,userController.sharedProfileData, userController.profileFollowingScreen)



//POST
router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreatePost)
router.post('/create-post', userController.mustBeLoggedIn, postController.create)
router.get('/post/:id', postController.viewSingle)
router.get('/post/:id/edit', userController.mustBeLoggedIn, postController.viewEditScreen)
router.post('/post/:id/edit', userController.mustBeLoggedIn, postController.edit)
router.post('/post/:id/delete', userController.mustBeLoggedIn, postController.delete)
router.post('/search', postController.search)


// Follow

router.post('/addFollow/:username',userController.mustBeLoggedIn,followController.addFollow)
router.post('/removeFollow/:username',userController.mustBeLoggedIn,followController.removeFollow)



module.exports = router