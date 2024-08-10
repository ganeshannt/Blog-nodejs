const userCollection = require('../db').db().collection('users')
const followCollection = require('../db').db().collection('follows')
const ObjectID = require('mongodb').ObjectID
const User = require('./User')

let Follow = function (wantToFollow, authorId) {
  this.wantToFollow = wantToFollow
  this.authorId = authorId
  this.errors = []
}

Follow.isVisitorIdFollowing = async function (pageUserId, authorId) {
  let followDoc = await followCollection.findOne({
    wantToFollowId: pageUserId,
    authorId: new ObjectID(authorId)
  })
  if (followDoc) {
    return true
  } else {
    return false
  }
}

Follow.prototype.validate = async function (action) {
  let wantToFollowAccount = await userCollection.findOne({
    username: this.wantToFollow
  })
  if (wantToFollowAccount) {
    this.wantToFollowId = wantToFollowAccount._id
  } else {
    this.errors.push('User not exist to follow')
  }
  // checking whether user already following or not
  let doesFollowExist = await followCollection.findOne({
    wantToFollowId: this.wantToFollowId,
    authorId: new ObjectID(this.authorId)
  })
  if (action == 'create') {
    if (doesFollowExist) {
      this.errors.push('You aleardy following this user')
    }
  }
  if (action == 'delete') {
    if (!doesFollowExist) {
      this.errors.push(
        'you are not able to unfollow the user that you were not followed'
      )
    }
  }
  // should not able to follow yourself
  if (this.wantToFollowId.equals(this.authorId)) {
    this.errors.push('you are not able to follow yourself')
  }
}

Follow.prototype.cleanUp = async function () {
  if (typeof this.wantToFollow != 'string') {
    this.wantToFollow = ''
  }
}

Follow.prototype.create = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    await this.validate('create')
    if (!this.errors.length) {
      await followCollection.insertOne({
        wantToFollowId: this.wantToFollowId,
        authorId: new ObjectID(this.authorId)
      })
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

Follow.prototype.delete = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    await this.validate('delete')
    if (!this.errors.length) {
      await followCollection.deleteOne({
        wantToFollowId: this.wantToFollowId,
        authorId: new ObjectID(this.authorId)
      })
      resolve()
    } else {
      console.log(this.errors)
      reject(this.errors)
    }
  })
}

Follow.getFollowersById = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('try FOLLOW', id)
      let followers = await followCollection
        .aggregate([
          { $match: { wantToFollowId: id } },
          {
            $lookup: {
              from: 'users',
              localField: 'authorId',
              foreignField: '_id',
              as: 'userDocument'
            }
          },
          {
            $project: {
              username: { $arrayElemAt: ['$userDocument.username', 0] },
              email: { $arrayElemAt: ['$userDocument.email', 0] }
            }
          }
        ])
        .toArray()
      console.log(followers)
      followers = followers.map(function (follower) {
        let user = new User(follower, true)
        return { username: follower.username, avatar: user.avatar }
      })
      console.log(followers)
      resolve(followers)
    } catch {
      reject()
    }
  })
}

Follow.getFollowingById = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('try FOLLOW', id)
      let followings = await followCollection
        .aggregate([
          { $match: { authorId: id } },
          {
            $lookup: {
              from: 'users',
              localField: 'wantToFollowId',
              foreignField: '_id',
              as: 'userDocument'
            }
          },
          {
            $project: {
              username: { $arrayElemAt: ['$userDocument.username', 0] },
              email: { $arrayElemAt: ['$userDocument.email', 0] }
            }
          }
        ])
        .toArray()
      console.log(followings)
      followings = followings.map(function (following) {
        let user = new User(following, true)
        return { username: following.username, avatar: user.avatar }
      })
      console.log(followings)
      resolve(followings)
    } catch {
      reject()
    }
  })
}

Follow.countFollowerByAuthor = function (id) {
  return new Promise(async (resolve, reject) => {
    let followerCount = await followCollection.countDocuments({
      wantToFollowId: id
    })
    resolve(followerCount)
  })
}

Follow.countFollowingByAuthor = function (id) {
  return new Promise(async (resolve, reject) => {
    let followingCount = await followCollection.countDocuments({ authorId: id })
    resolve(followingCount)
  })
}

module.exports = Follow
