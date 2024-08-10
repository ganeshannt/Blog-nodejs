const apiRouter = require('express').Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postcontroller')
const cors = require('cors')

apiRouter.use(cors())

apiRouter.post('/login', userController.apiLogin)
apiRouter.post(
  '/create-post',
  userController.apiMustBeLoggedIn,
  postController.apiCreate
)
apiRouter.get('/postbyauthor/:username', userController.apiGetPostByUsername)
apiRouter.post(
  '/delete-post/:id',
  userController.apiMustBeLoggedIn,
  postController.apiDelete
)

module.exports = apiRouter
