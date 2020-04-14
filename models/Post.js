const postCollection = require('../db').db().collection("post")
const objectID = require('mongodb').ObjectId
const User = require('./User')


let Post = function(data,userid){
    this.data = data
    this.error = []
    this.userid = userid
}



Post.prototype.clean = function(){
    if (typeof(this.data.title) != "string") {
        this.data.title = ""
    }
    if (typeof(this.data.body) != "string") {
        this.data.body = ""
    }
// get rid of bugus properties
this.data ={
    title : this.data.title.trim(),
    body:this.data.body.trim(),
    author: objectID(this.userid),
    createdDate: new Date()
}
}


Post.prototype.validate = function(){
    if (typeof(this.data.title) != "string") {
        this.error.push("You must provide title")
    }
    if (typeof(this.data.body) != "string") {
        this.error.push("You must write content right ?")
    }

}




Post.prototype.create = function(){

    return new Promise((resolve,reject) => {
        this.validate()
        this.clean()
        if (!this.error.length) {
            //save post
            postCollection.insertOne(this.data)
            .then(() => {
                resolve()
            })
            .catch(()=>{
                this.error.push("Please try after sometime")
                reject(this.error)
            })
        } else {
            // throw error
            reject(this.error)
        }
    })
}

Post.findSingleById = function(id){
    return new Promise(async function(resolve,reject){
        if (typeof(id) != "string" || !objectID.isValid(id) ) {
            reject()
            return
        }
        let posts = await postCollection.aggregate([
            {$match : {_id: new objectID(id)}},
            {$lookup:{from:"users",localField: "author", foreignField:"_id", as:"authorDocument"}},
            {$project:{
                title:1,
                body:1,
                createdDate:1,
                author:{$arrayElemAt:["$authorDocument",0]}
            }}
        ]).toArray()

        // clean up author property in each post object
        posts = posts.map(function(post){
            post.author = {
                username:post.author.username,
                avatar: new User(post.author,true).avatar
            }
            return post
        })

        // let post = await postCollection.findOne({_id: new objectID(id)})
        if (posts.length) {
            console.log(posts[0])
            resolve(posts[0])
        } else {
            reject()
        }
    })
}

module.exports = Post