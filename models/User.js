const bcrypt = require('bcryptjs')
const validator = require('validator')
const userCollection = require('../db').db().collection('users')
const visitorCollection = require('../db').db().collection('visitors')
const ObjectID = require('mongodb').ObjectID
const md5 = require('md5')

let User = function (data, getAvatar) {
  this.data = data
  this.error = []
  if (getAvatar == undefined) {
    getAvatar = false
  }
  if (getAvatar) {
    this.getAvatar()
  }
}

User.visiterCount = async function () {
  let oldVisits = await visitorCollection.findOne({
    _id: new ObjectID('5eaae9c3e0e949a9293355d9')
  })
  console.log(oldVisits)
  let currentVisits = oldVisits.visitersCount
  currentVisits++
  console.log(currentVisits)
  await visitorCollection.updateOne(
    { _id: new ObjectID('5eaae9c3e0e949a9293355d9') },
    { $set: { visitersCount: currentVisits } }
  )
  return currentVisits
}

User.prototype.cleanUp = function () {
  if (typeof this.data.username != 'string') {
    this.data.username = ''
  }
  if (typeof this.data.email != 'string') {
    this.data.email = ''
  }
  if (typeof this.data.password != 'string') {
    this.data.password = ''
  }

  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password
  }
}

User.prototype.validate = function () {
  return new Promise(async (resolve, reject) => {
    if (this.data.username == '') {
      this.error.push('Username should not be empty')
    }
    if (
      this.data.username != '' &&
      !validator.isAlphanumeric(this.data.username)
    ) {
      this.error.push('username only contains letters and numbers')
    }
    if (!validator.isEmail(this.data.email)) {
      this.error.push('Invalid email')
    }
    if (this.data.email == '') {
      this.error.push('Email should not be empty')
    }
    if (this.data.password == '') {
      this.error.push('Password should not be empty')
    }
    if (this.data.password.length > 0 && this.data.password.length < 7) {
      this.error.push('Password must be above 8 charactors ')
    }
    if (this.data.password.length > 15) {
      this.error.push('passworld length should be below 16')
    }

    // Only if username is valid then check to see if it's already taken
    if (
      this.data.username.length > 2 &&
      this.data.username.length < 31 &&
      validator.isAlphanumeric(this.data.username)
    ) {
      let usernameExists = await userCollection.findOne({
        username: this.data.username
      })
      if (usernameExists) {
        this.error.push('That username is already taken.')
      }
    }

    // Only if email is valid then check to see if it's already taken
    if (validator.isEmail(this.data.email)) {
      let emailExists = await userCollection.findOne({ email: this.data.email })
      if (emailExists) {
        this.error.push('That email is already being used.')
      }
    }
    resolve()
  })
}

User.prototype.signup = function () {
  return new Promise(async (resolve, reject) => {
    // Step #1: Validate user data
    this.cleanUp()
    await this.validate()

    // Step #2: Only if there are no validation errors
    // then save the user data into a database
    if (!this.error.length) {
      // hash user password
      let salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
      await userCollection.insertOne(this.data)
      this.getAvatar()
      resolve()
    } else {
      reject(this.error)
    }
  })
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

User.prototype.login = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    userCollection
      .findOne({ username: this.data.username })
      .then(attemptedUser => {
        // if (attemptedUser && attemptedUser.password == this.data.password)
        if (
          attemptedUser &&
          bcrypt.compareSync(this.data.password, attemptedUser.password)
        ) {
          this.data = attemptedUser
          this.getAvatar()
          resolve('congrats')
        } else {
          reject('Invalid username / password')
        }
      })
      .catch(function () {
        reject('Please try again later')
      })
  })
}

User.prototype.getAvatar = function () {
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

User.findByUsername = function (username) {
  return new Promise(function (resolve, reject) {
    if (typeof username != 'string') {
      reject()
      return
    } else {
      userCollection
        .findOne({ username: username })
        .then(function (userDoc) {
          if (userDoc) {
            userDoc = new User(userDoc, true)
            userDoc = {
              _id: userDoc.data._id,
              username: userDoc.data.username,
              avatar: userDoc.avatar
            }
            resolve(userDoc)
          } else {
            reject()
          }
        })
        .catch(function () {
          reject()
        })
    }
  })
}

User.findByEmail = function (email) {
  return new Promise(async function (resolve, reject) {
    if (typeof email != 'string') {
      resolve(false)
      return
    }
    let user = await userCollection.findOne({ email: email })
    if (user) {
      resolve(true)
    } else {
      resolve(false)
    }
  })
}

module.exports = User
