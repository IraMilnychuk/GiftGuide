const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};