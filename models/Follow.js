const userCollection = require('../db').db().collection("users")
const followCollection = require('../db').db().collection("follows")
const ObjectID = require('mongodb').ObjectID


let Follow = function (wantToFollow, authorId) {
    this.wantToFollow = wantToFollow
    this.authorId = authorId
    this.errors = []
}

Follow.isVisitorIdFollowing = async function(pageUserId,authorId){
    let followDoc = await followCollection.findOne({ wantToFollowId: pageUserId, authorId: new ObjectID(authorId) })
    if (followDoc) {
        return true
    } else {
        return false
    }
}


Follow.prototype.validate = async function () {
    let wantToFollowAccount = await userCollection.findOne({ username: this.wantToFollow })
    if (wantToFollowAccount) {
        this.wantToFollowId = wantToFollowAccount._id
    } else {
        this.errors.push("User not exist to follow")
    }
}


Follow.prototype.cleanUp = async function () {
    if (typeof (this.wantToFollow) != "string") { this.wantToFollow = "" }
}

Follow.prototype.create = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate()
        if (!this.errors.length) {
            await followCollection.insertOne({ wantToFollowId: this.wantToFollowId, authorId: new ObjectID(this.authorId) })
            resolve()
        } else {
            reject(this.errors)
        }
    })
}

module.exports = Follow