if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const cors = require('cors')
const express = require('express')
const app = express()
const port = 3000

app.use(cors())




module.exports = app
