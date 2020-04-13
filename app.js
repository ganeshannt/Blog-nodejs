const session = require('express-session')
const express = require('express')
const mongoStore  = require('connect-mongo')(session)
const flash = require('connect-flash')
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


app.use(function(req,res,next){
    res.locals.user  = req.session.user
    next()
})


app.use('/',router)

// app.set("express object","folder name")
app.set('views','views')
app.set('view engine','ejs')

module.exports = app