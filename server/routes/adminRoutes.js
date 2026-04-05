const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Публічні маршрути для адмін-логіну
router.post('/verify-password', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    const token = Buffer.from(`${Date.now()}:${password}`).toString('base64');
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Невірний пароль' });
  }
});

router.get('/verify-token', (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken) return res.status(401).json({ valid: false });
  try {
    const decoded = Buffer.from(adminToken, 'base64').toString();
    const [timestamp, password] = decoded.split(':');
    if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ valid: false });
    if (Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) return res.status(401).json({ valid: false });
    res.json({ valid: true });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

// Довідники
router.get('/recipients', adminController.getAllRecipients);
router.get('/occasions', adminController.getAllOccasions);
router.get('/gift-types', adminController.getAllGiftTypes);
router.get('/relationships', adminController.getAllRelationships);
router.get('/age-ranges', adminController.getAllAgeRanges);
router.get('/genders', adminController.getAllGenders);
router.get('/characters', adminController.getAllCharacters);
router.get('/interests', adminController.getAllInterests);
router.get('/tags', adminController.getAllTags);

// Фільтри товарів
router.get('/product-filters/:productId', adminController.getProductFilters);
router.put('/product-filters/:productId', adminController.updateProductFilters);

// ========== МАРШРУТИ ДЛЯ ВІДГУКІВ (РОЗКОМЕНТОВАНО) ==========
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', adminController.deleteReview);

router.delete('/products/:id', adminController.deleteProduct);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', adminController.deleteReview);

module.exports = router;