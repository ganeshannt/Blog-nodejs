const express = require('express')

const app = express()

// Router config
const router = require("./router")


app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))
app.use(express.json())

// app.set("express object","folder name")
app.set('views','views')
app.set('view engine','ejs')


app.use('/',router)

module.exports = app










