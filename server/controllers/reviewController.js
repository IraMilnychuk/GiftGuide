const Rating = require('../models/Rating');
const db = require('../config/db');

exports.addReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  if (!productId || rating === undefined) {
    return res.status(400).json({ message: 'productId and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }
  try {
    await Review.add(req.user.id, productId, rating, comment || '');
    // Оновлюємо середню оцінку в таблиці products (опціонально)
    const avg = await Rating.getAverageRating(productId);
    await db.execute('UPDATE products SET rating = ? WHERE id = ?', [avg, productId]);
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductReviews = async (req, res) => {
  const { productId } = req.params;
  try {
    const reviews = await Review.getByProduct(productId);
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};