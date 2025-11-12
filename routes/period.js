const express = require('express')
const PeriodController = require('../controllers/periodController')
const router = express.Router()


router.get('/', PeriodController.read)
router.post('/', PeriodController.create)
router.put('/:id', PeriodController.update)


module.exports = router