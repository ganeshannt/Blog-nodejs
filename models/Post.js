const postCollection = require('../db').db().collection("post")
const objectID = require('mongodb').ObjectID


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
        let post = await postCollection.findOne({_id: new objectID(id)})
        if (post) {
            resolve(post)
        } else {
            reject()
        }
    })
}

module.exports = Post