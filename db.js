const mongodb = require('mongodb')
const dotenv = require('dotenv')
dotenv.config()

// Db connection
mongodb.connect(
  process.env.CONNECTIONSTRING,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, client) {
    module.exports = client
    const app = require('./app')
    app.listen(process.env.PORT)
    console.log('connected')
  }
)
