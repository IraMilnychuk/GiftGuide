const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/favorites', authenticateToken, userController.getFavorites);
router.post('/favorites', authenticateToken, userController.addFavorite);
router.delete('/favorites/:productId', authenticateToken, userController.removeFavorite);

router.post('/ratings', authenticateToken, userController.addRating);

router.get('/reviews/:productId', userController.getProductReviews);
router.post('/reviews', authenticateToken, userController.addReview);

module.exports = router;