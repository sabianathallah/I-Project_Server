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
const auth = require('../middlewares/authentication')
const errorHandler = require('../middlewares/errorHandler')
// const {isAdmin} = require('../middlewares/authorization')


//=============================================== ENDPOINT (PUBLIC) 
router.get('/pub/articles', ArticleController.read)
router.get('/pub/articles/:id', ArticleController.detailById)



//=============================================== ENDPOINT LOGIN N ADDUSER
router.post('/login', LoginRegisterController.login)
//================ USE MIDDLEWARE
router.use(auth)
//================
router.post('/adduser', LoginRegisterController.register)



//=============================================== USE ERRORHANDLER
router.use(errorHandler)

module.exports = router