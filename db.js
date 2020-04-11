const mongodb = require('mongodb')

// Db connection
let db
let connectionString = 'mongodb+srv://todoapp:pejppiONw7N1lAgd@cluster0-retqf.mongodb.net/blogdb?retryWrites=true'
mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true},function(err,client){
  module.exports = client.db()
  const app = require('./app')
  app.listen(3000)
console.log("connected");
})