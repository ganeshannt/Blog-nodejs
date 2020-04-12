const bcrypt = require("bcryptjs")
const validator = require('validator')
const userCollection = require('../db').db().collection("users")


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
    if(this.data.username == "") {this.error.push("Username should not be empty")}
    if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {this.error.push("username only contains letters and numbers")}
    if (!validator.isEmail(this.data.email)){this.error.push("Invalid email")}
    if(this.data.email == ""){this.error.push("Email should not be empty")}
    if(this.data.password == ""){this.error.push("Password should not be empty")}
    if(this.data.password.length > 0 && this.data.password.length < 7 ){this.error.push("Password must be above 8 charactors ")}
    if(this.data.password.length > 15) {this.error.push("passworld length should be below 16")}
}


User.prototype.signup = function(){
    this.cleanUp()
    this.validate()
    if (!this.error.length) {
        // hash user password
        let salt = bcrypt.genSaltSync(10)
        this.data.password = bcrypt.hashSync(this.data.password,salt)
        // storing into db
        userCollection.insertOne(this.data)
    }
}




// User.prototype.login = function(){
//     return new Promise((resolve,reject) => {
//         this.cleanUp()
//         userCollection.findOne({username : this.data.username},(err,attemptedUser) => {
//             if (attemptedUser && attemptedUser.password == this.data.password) {
//                 resolve("congrats")
//             } else {
//                 reject("Invalid username / password")
//             }
//         })
//     })


  
 


    User.prototype.login = function(){
        return new Promise((resolve,reject) => {
            this.cleanUp()
            userCollection.findOne({username : this.data.username})
            .then((attemptedUser) => {
                // if (attemptedUser && attemptedUser.password == this.data.password) 
                if (attemptedUser && bcrypt.compareSync(this.data.password,attemptedUser.password)) {
                    resolve("congrats")
                } else {
                    reject("Invalid username / password")
                }
            })
            .catch(function(){
                reject("Please try again later")
            })
        })
    }



module.exports = User