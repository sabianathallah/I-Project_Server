const express = require('express')
const router = express.Router()
//===============================
const articleRouter = require('./article')
const periodRouter = require('./period')

//=============================================== IMPORT CONTROLLER
const LoginRegisterController = require('../controllers/../controllers/loginRegisterController')
const ArticleController = require('../controllers/articleController')
const PeriodController = require('../controllers/periodController')

//=============================================== IMPORT MIDDLEWARE
const authentication = require('../middlewares/authentication')
const errorHandler = require('../middlewares/errorHandler')
const {isAdmin} = require('../middlewares/authorization')


//=============================================== ENDPOINT (PUBLIC) 
router.get('/pub/articles', ArticleController.read)
router.get('/pub/articles/:id', ArticleController.detailById)


//=============================================== ENDPOINT LOGIN N ADDUSER
router.post('/login', LoginRegisterController.login)
router.post('/register', LoginRegisterController.register)

//================ USE MIDDLEWARE AUTHENTICATION (FOR PUBLIC ROUTES)
router.use(authentication)

//=============================================== ENDPOINT (PRIVATE)
router.use(isAdmin)


//=============================================== USE ERRORHANDLER
router.use(errorHandler)

module.exports = router