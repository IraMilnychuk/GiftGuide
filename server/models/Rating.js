const db = require('../config/db');

class Rating {
  static async set(userId, productId, rating) {
    await db.execute(
      'INSERT INTO ratings (user_id, product_id, rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?',
      [userId, productId, rating, rating]
    );
  }

  static async getUserRating(userId, productId) {
    const [rows] = await db.execute(
      'SELECT rating FROM ratings WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return rows[0] ? rows[0].rating : null;
  }

  static async getAverageRating(productId) {
    const [rows] = await db.execute(
      'SELECT AVG(rating) as avg FROM ratings WHERE product_id = ?',
      [productId]
    );
    return rows[0].avg ? parseFloat(rows[0].avg) : 0;
  }
}

module.exports = Rating;