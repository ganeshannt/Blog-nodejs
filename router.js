const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postcontroller')

//Home
router.get('/', userController.home)
//USER
router.post('/signup',userController.signup)
router.post('/login',userController.login)
router.post('/signout',userController.signout)
router.get('/profile/:username',userController.ifUserExists,userController.profilePostScreen)
//POST
router.get('/create-post',userController.mustBeLoggedIn,postController.viewCreatePost)
router.post('/create-post',userController.mustBeLoggedIn,postController.create)
router.get('/post/:id',postController.viewSingle)

module.exports = router