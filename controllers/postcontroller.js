const Post = require ('../models/Post')


exports.viewCreatePost = function(req,res){
    res.render('create-post')
}

exports.create = function(req,res){
    // res.send("post has been saved")
    let post = new Post(req.body,req.session.user._id)
    post.create().then(function() {
        res.send("Post created")
    }).catch(function(error){
        res.send(error)
    })
}


exports.viewSingle  = async function(req,res){
    try{
        let post = await Post.findSingleById(req.params.id)
        res.render('single-post-screen',{post: post})
    } catch {
        res.render('404')
    }
}