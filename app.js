if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const cors = require('cors')
const express = require('express')
const app = express()
const port = 3000

app.use(cors({
  origin: true,
  credentials: true
}))
const router = require('./routes')

//=============================================
app.use(express.json())
app.use(express.urlencoded({extended : false}))

//=============================================
app.use(router)




module.exports = app
