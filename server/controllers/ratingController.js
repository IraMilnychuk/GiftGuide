const Rating = require('../models/Rating');

exports.setRating = async (req, res) => {
  const { productId, rating } = req.body;
  if (!productId || rating === undefined) {
    return res.status(400).json({ message: 'productId and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }
  try {
    await Rating.set(req.user.id, productId, rating);
    const avg = await Rating.getAverageRating(productId);
    res.json({ average: avg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductRating = async (req, res) => {
  const { productId } = req.params;
  try {
    const avg = await Rating.getAverageRating(productId);
    let userRating = null;
    if (req.user) {
      userRating = await Rating.getUserRating(req.user.id, productId);
    }
    res.json({ average: avg, userRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};