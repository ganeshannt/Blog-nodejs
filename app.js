const expree = require('express')
const mongodb = require('mongodb')

const app = expree()





// Db connection
let db
let connectionString = 'mongodb+srv://todoapp:pejppiONw7N1lAgd@cluster0-retqf.mongodb.net/blogdb?retryWrites=true'
mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true},function(err,client){
  db = client.db()
  app.listen(3000)
console.log("connected");
    
})









app.get('/',function(req,res){
    res.send("Welcome to next journey")
})


