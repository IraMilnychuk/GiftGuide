const express = require('express');
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth); // всі маршрути захищені

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:productId', removeFavorite);

module.exports = router;