const Favorite = require('../models/Favorite');

exports.getFavorites = async (req, res) => {
  try {
    const productIds = await Favorite.findByUser(req.user.id);
    res.json({ favorites: productIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addFavorite = async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ message: 'productId is required' });
  }
  try {
    const exists = await Favorite.exists(req.user.id, productId);
    if (exists) {
      return res.status(400).json({ message: 'Already in favorites' });
    }
    await Favorite.add(req.user.id, productId);
    res.status(201).json({ message: 'Added to favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFavorite = async (req, res) => {
  const { productId } = req.params;
  try {
    await Favorite.remove(req.user.id, productId);
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};