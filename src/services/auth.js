const express = require('express');
const router = express.Router();
const controller = require('../controllers/nomenclatureController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', controller.createNomenclature);
router.get('/:productId', controller.getNomenclature);

module.exports = router;