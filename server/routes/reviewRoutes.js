const express = require('express');
const { addReview, getProductReviews } = require('../controllers/reviewController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:productId', getProductReviews);
router.post('/', auth, addReview);

module.exports = router;