const userCollection = require('../db').db().collection("users")
const followCollection = require('../db').db().collection("follows")
const ObjectID = require('mongodb').ObjectId

let Follow = function(wantToFollow,authorId){
    this.wantToFollow = wantToFollow
    this.authorId = authorId
    this.errors = []
}



Follow.prototype.validate = async function (){
let wantToFollowAccount = await userCollection.findOne({username : this.wantToFollow})
if (wantToFollowAccount) {
    this.wantToFollowId = wantToFollowAccount._id   
} else {
    this.errors.push("User not exist to follow")
}
}


Follow.prototype.cleanUp = function(){
    if (typeof(wantToFollow) != "string") { this.wantToFollow = ""   }
}

Follow.prototype.create = function(){
    return new Promise(async (reject,resolve)=>{
        this.cleanUp()
        await this.validate()
        if (!this.errors.length) {
            await followCollection.insertOne({followedId : this.wantToFollowId,authorId : new ObjectID(this.authorId)})
            resolve()
        }else{
            reject(this.errors)
        }
    })
}





module.exports = Follow