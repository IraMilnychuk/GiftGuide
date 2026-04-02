const express = require('express');
const { setRating, getProductRating } = require('../controllers/ratingController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

// Публічний маршрут для отримання середньої оцінки
router.get('/:productId', getProductRating);
// Захищений маршрут для встановлення оцінки
router.post('/', auth, setRating);

module.exports = router;