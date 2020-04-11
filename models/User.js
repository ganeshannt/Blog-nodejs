const validator = require('validator')
const userCollection = require('../db').collection("users")


let User = function(data){
    this.data = data
    this.error = []
}


User.prototype.cleanUp = function(){
    if(typeof(this.data.username) != "string") {this.data.username = ""}
    if(typeof(this.data.email) != "string") {this.data.email = ""}
    if(typeof(this.data.password) != "string") {this.data.password = ""}

    this.data = {
        username : this.data.username.trim().toLowerCase(),
        email : this.data.email.trim().toLowerCase(),
        password : this.data.password
    }
}

User.prototype.validate = function(){
    if(this.data.username == "") {this.error.push("Invalid username")}
    if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {this.error.push("username only contains letters and numbers")}
    if (!validator.isEmail(this.data.email)){this.error.push("Invalid email")}
    if(this.data.email == ""){this.error.push("Invalid email")}
    if(this.data.password == ""){this.error.push("Invalid passoword")}
    if(this.data.password.length > 0 && this.data.password.length < 7 ){this.error.push("Password must be above 8 charactors ")}
    if(this.data.password.length > 15) {this.error.push("passworld length should be below 16")}
}


User.prototype.signup = function(){
    this.cleanUp()
    this.validate()


    if (!this.error.length) {
        userCollection.insertOne(this.data)
    }
}


module.exports = User