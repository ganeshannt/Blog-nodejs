const Post = require("../models/Post");

exports.viewCreatePost = function (req, res) {
  res.render("create-post");
};

exports.create = function (req, res) {
  // res.send("post has been saved")
  let post = new Post(req.body, req.session.user._id);
  post
    .create()
    .then(function (newId) {
      req.flash("success", "New post created");
      req.session.save(() => res.redirect(`/post/${newId}`));
      // res.send("Post created")
    })
    .catch(function (error) {
      error.forEach((error) => req.flash("errors", error));
      req.session.save(() => res.redirect("/create-post"));
    });
};

// Create via API
exports.apiCreate = function (req, res) {
  let post = new Post(req.body, req.apiUser._id);
  post
    .create()
    .then(function (newId) {
      res.json("Congrats post created")
    })
    .catch(function (error) {
      res.json(error)
    });
};




exports.viewSingle = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    res.render("single-post-screen", { post: post });
  } catch {
    res.render("404");
  }
};

exports.viewEditScreen = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id);
    if ((post.authorId = req.visitorId)) {
      res.render("edit-post", { post: post });
    } else {
      req.flash("errors", "You dont have permission to access that page");
      req.session.save(() => res.redirect("/"));
    }
  } catch {
    res.render("404");
  }
};

exports.edit = function (req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id);
  post
    .update()
    .then((status) => {
      // post was successfully added
      // or validatation error after edit
      if (status == "success") {
        // post updated
        req.flash("success", "post successfully updated");
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      } else {
        // validation error
        post.error.forEach(function (error) {
          req.error.forEach("error", error);
        });
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      }
    })
    .catch(() => {
      //post with req id does not exist
      // or current user not owner of that post
      req.flash("errors", "you dont have permission to access to this page");
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.delete = function (req, res) {
  Post.delete(req.params.id, req.visitorId)
    .then(() => {
      req.flash("success", "Post successfully deleted");
      req.session.save(() =>
        res.redirect(`/profile/${req.session.user.username}`)
      );
    })
    .catch(() => {
      req.flash("errors", "dont have permission to perform that action");
      req.session.save(() => {
        res.redirect("/");
      });
    });
};

// delete via API
exports.apiDelete = function (req, res) {
  Post.delete(req.params.id, req.apiUser._id)
    .then(() => {
      res.json("Deleted successfully")
    })
    .catch(() => {
      res.json("you do not have permission to perform that action")
    });
};



exports.search = function (req, res) {
  Post.search(req.body.searchTerm).then(post => {
    res.json(post)
  }).catch(() => {
    res.json([])
  })
}
