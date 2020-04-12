const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')

router.get('/', userController.home)
router.post('/signup',userController.signup)
router.post('/login',userController.login)
router.post('/signout',userController.signout)

module.exports = router