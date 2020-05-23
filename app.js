const session = require('express-session')
const express = require('express')
const mongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const markdown = require('marked')
const sanitizeHtml = require('sanitize-html')
const app = express()
const csrf = require('csurf')



app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// API Stuff
app.use('/api',require('./router-api'))


// session config
let sessionOptions = session({
    secret: "javascript is sooooooo cool",
    store: new mongoStore({ client: require('./db') }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, httpOnly: true
    }
})
app.use(sessionOptions)
app.use(flash())

// Router config
const router = require("./router")


//  run for every request
app.use(function (req, res, next) {

    // mark down function
    res.locals.filterUserHtml = function (content) {
        return sanitizeHtml(markdown(content), { allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'bold', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes: {} })
    }
    // Error and success flash message
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")

    //  make current user ud available on req object

    if (req.session.user) {
        req.visitorId = req.session.user._id
    } else {
        req.visitorId = 0
    }

    // make user session data from within view template 
    res.locals.user = req.session.user
    next()
})

// app.set("express object","folder name")
app.set('views', 'views')
app.set('view engine', 'ejs')

// csrf token configuration
app.use(csrf())
app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken()
    next()
})


app.use('/', router)


app.use(function (err, req, res, next) {
    if (err) {
        if (err.code == "EBADCSRFTOKEN") {
            req.flash('errors', 'Cross site request forgery detected')
            req.session.save(() => res.redirect('/'))
        } else {
            res.render('404')
        }
    }
})





const server = require('http').createServer(app)
const io = require('socket.io')(server)

// make available the user session for socket.io
io.use(function (socket, next) {
    sessionOptions(socket.request, socket.request.res, next)
})


io.on('connection', function (socket) {
    if (socket.request.session.user) {
        let user = socket.request.session.user

        socket.emit('welcome', { username: user.username, avatar: user.avatar })

        socket.on('chatMessageFromBrowser', function (data) {
            console.log(data.message)
            // broadcasting message 
            socket.broadcast.emit('chatMessageFromBrowser', { message: sanitizeHtml(data.message, { allowedTags: [], allowedAttributes: {} }), username: user.username, avatar: user.avatar })
        })
        console.log("new user connected!")
    }
})
module.exports = server