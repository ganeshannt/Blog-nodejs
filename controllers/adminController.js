const Admin = require('../models/Admin')

exports.login = function passwordProtected(req, res) {
  res.set('WWW-Authenticate', 'Basic realm = "Admin Login"')
  console.log(req.headers.authorization)
  if (req.headers.authorization == 'Basic Z2FuZXNoYW46d2VsY29tZQ==') {
    res.render('admin')
  } else {
    res.status(401).send('Authentication Required')
  }
}
