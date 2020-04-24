const postCollection = require('../db').db().collection("post")
const objectID = require('mongodb').ObjectId
const sanitizeHtml = require('sanitize-html')
const User = require('./User')


let Post = function (data, userid, requestedPostId) {
    this.data = data
    this.error = []
    this.userid = userid
    this.requestedPostId = requestedPostId
}



Post.prototype.clean = function () {
    if (typeof (this.data.title) != "string") {
        this.data.title = ""
    }
    if (typeof (this.data.body) != "string") {
        this.data.body = ""
    }
    // get rid of bugus properties
    this.data = {
        title: sanitizeHtml(this.data.title.trim(), { allowedTags: [], allowedAttributes: {} }),
        body: sanitizeHtml(this.data.body.trim(), { allowedTags: [], allowedAttributes: {} }),
        author: objectID(this.userid),
        createdDate: new Date()
    }
}


Post.prototype.validate = function () {
    if (typeof (this.data.title) != "string") {
        this.error.push("You must provide title")
    }
    if (typeof (this.data.body) != "string") {
        this.error.push("You must write content right ?")
    }

}




Post.prototype.create = function () {

    return new Promise((resolve, reject) => {
        this.validate()
        this.clean()
        if (!this.error.length) {
            //save post
            postCollection.insertOne(this.data)
                .then((info) => {
                    resolve(info.ops[0]._id)
                })
                .catch(() => {
                    this.error.push("Please try after sometime")
                    reject(this.error)
                })
        } else {
            // throw error
            reject(this.error)
        }
    })
}



Post.prototype.update = function () {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(this.requestedPostId, this.userid)
            if (post.isVisitorOwner) {
                // actual update on DB
                let status = await this.actuallyUpdate()
                resolve(status)
            } else {
                reject()
            }
        } catch {
            reject()

        }
    })
}



Post.prototype.actuallyUpdate = function () {
    return new Promise(async (resolve, reject) => {
        this.clean()
        this.validate()
        if (!this.error.length) {
            await postCollection.findOneAndUpdate({ _id: new objectID(this.requestedPostId) }, {
                $set: {
                    title: this.data.title,
                    body: this.data.body
                }
            })
            resolve("success")
        } else {
            resolve("failure")
        }
    })
}



Post.reusablePostQuery = function (uniqueOperations, visitorId) {
    return new Promise(async function (resolve, reject) {
        let aggOperations = uniqueOperations.concat([
            { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "authorDocument" } },
            {
                $project: {
                    title: 1,
                    body: 1,
                    createdDate: 1,
                    authorId: "$author",
                    author: { $arrayElemAt: ["$authorDocument", 0] }
                }
            }
        ])
        let posts = await postCollection.aggregate(aggOperations).toArray()

        // clean up author property in each post object
        posts = posts.map(function (post) {
            post.isVisitorOwner = post.authorId.equals(visitorId)
            post.authorId = undefined
            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post
        })
        resolve(posts)
    })
}







Post.findSingleById = function (id, visitorId) {
    return new Promise(async function (resolve, reject) {
        if (typeof (id) != "string" || !objectID.isValid(id)) {
            reject()
            return
        }



        // let posts = await postCollection.aggregate([
        //     {$match : {_id: new objectID(id)}},
        //     {$lookup:{from:"users",localField: "author", foreignField:"_id", as:"authorDocument"}},
        //     {$project:{
        //         title:1,
        //         body:1,
        //         createdDate:1,
        //         author:{$arrayElemAt:["$authorDocument",0]}
        //     }}
        // ]).toArray()

        // // clean up author property in each post object
        // posts = posts.map(function(post){
        //     post.author = {
        //         username:post.author.username,
        //         avatar: new User(post.author,true).avatar
        //     }
        //     return post
        // })


        let posts = await Post.reusablePostQuery([
            { $match: { _id: new objectID(id) } }
        ], visitorId)
        // let post = await postCollection.findOne({_id: new objectID(id)})
        if (posts.length) {
            console.log(posts[0])
            resolve(posts[0])
        } else {
            reject()
        }
    })
}

Post.findByAuthorId = function (authorId) {
    return Post.reusablePostQuery([
        { $match: { author: authorId } },
        { $sort: { createdDate: -1 } }
    ])
}


Post.delete = function (postIdDelete, currentUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(postIdDelete, currentUserId)
            if (post.isVisitorOwner) {
                await postCollection.deleteOne({ _id: new objectID(postIdDelete) })
                resolve()
            } else {
                reject()
            }
        } catch  {
            reject()
        }
    })
}


Post.search = function (searchTerm) {
    return new Promise(async (resolve, reject) => {
        if (typeof (searchTerm) == "string") {
            console.log(searchTerm)
            let posts = await Post.reusablePostQuery([
                // to search in mongodb
                { $match: { $text: { $search: searchTerm } } }
                // to sort the search result 
                // {sort : {score : {$meta : "textScore"}}}
            ])

            resolve(posts)
        } else {
            reject()
        }
    })
}

Post.countPostByAuthor = function (id) {
    return new Promise(async (resolve, reject) => {
        let postCount = await postCollection.countDocuments({ author: id })
        resolve(postCount)
    })
}

module.exports = Post