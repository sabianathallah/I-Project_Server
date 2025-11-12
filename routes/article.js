const express = require('express')
const ArticleController = require('../controllers/articleController')
const UploadimageController = require('../controllers/uploadimageController')
const router = express.Router()

//=============================================== IMPORT UNTUK MULTER
const upload = require('../utility/multer')
const middlewaresUpload = upload.single('file')

router.get('/', ArticleController.read)
router.post('/', ArticleController.create)
router.patch('/upload/:id', middlewaresUpload, UploadimageController.uploadimage)
router.get('/:id', ArticleController.detailById)
router.put('/:id', ArticleController.update)
router.delete('/:id', ArticleController.delete)


module.exports = router