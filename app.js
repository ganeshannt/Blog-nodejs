const session = require('express-session')
const express = require('express')
const mongoStore  = require('connect-mongo')(session)
const flash = require('connect-flash')
const markdown = require('marked')
const sanitizeHtml = require('sanitize-html')
const app = express()


// session config
let sessionOptions = session({
    secret : "javascript is sooooooo cool",
    store :   new mongoStore({client : require('./db')}),
    resave:false,
    saveUninitialized : false,
    cookie: {
        maxAge:1000*60*60*24,httpOnly:true
    }
})
app.use(sessionOptions)
app.use(flash())

// Router config
const router = require("./router")

app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//  run for every request
app.use(function(req,res,next){

// mark down function
res.locals.filterUserHtml = function(content){
    return sanitizeHtml(markdown(content), {allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'bold', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes: {}})
}
// Error and success flash message
res.locals.errors = req.flash("errors")
res.locals.success = req.flash("success")

//  make current user ud available on req object

    if (req.session.user) {
        req.visitorId = req.session.user._id
    }else{
        req.visitorId = 0
    }

    // make user session data from within view template 
    res.locals.user  = req.session.user
    next()
})


app.use('/',router)

// app.set("express object","folder name")
app.set('views','views')
app.set('view engine','ejs')

const server = require('http').createServer(app)
const io = require('socket.io')(server)

io.on('connection',function(socket){
    socket.on('chatMessageFromBrowser',function(data){
        console.log(data.message)
        io.emit('chatMessageFromBrowser',{message:data.message})
    })
    console.log("new user connected!")
})
module.exports = server