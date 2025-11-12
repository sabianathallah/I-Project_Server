const express = require('express')
const router = express.Router()

const articleRouter = require('./article')
const periodRouter = require('./period')
const orderRouter = require('./order')
const chatRouter = require('./chat')

const LoginRegisterController = require('../controllers/../controllers/loginRegisterController')
const ArticleController = require('../controllers/articleController')
const PeriodController = require('../controllers/periodController')

const authentication = require('../middlewares/authentication')
const errorHandler = require('../middlewares/errorHandler')
const isAdmin = require('../middlewares/authorization')


//=============================================== ENDPOINT (PUBLIC) 
router.get('/pub/articles', ArticleController.read)
router.get('/pub/articles/:id', ArticleController.detailById)
router.get('/pub/periods', PeriodController.read)

//=============================================== ENDPOINT USER
router.post('/login', LoginRegisterController.login)
router.post('/register', LoginRegisterController.register)
router.post('/google-login', LoginRegisterController.googleLogin)

//================ USE MIDDLEWARE AUTHENTICATION (FOR PUBLIC ROUTES WITH AUTHENTICATION)
router.use('/orders', authentication, orderRouter)
router.use('/chat', authentication, chatRouter)


//=============================================== ADMIN-ONLY ENDPOINTS
router.use(isAdmin)
router.use('/articles', articleRouter)
router.use('/periods', periodRouter)


//=============================================== USE ERRORHANDLER
router.use(errorHandler)

module.exports = router