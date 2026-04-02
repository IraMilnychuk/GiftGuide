const db = require('../config/db');

class Review {
  static async add(userId, productId, rating, comment) {
    await db.execute(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, productId, rating, comment]
    );
  }

  static async getByProduct(productId) {
    const [rows] = await db.execute(
      `SELECT r.*, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC`,
      [productId]
    );
    return rows;
  }

  static async getUserReview(userId, productId) {
    const [rows] = await db.execute(
      'SELECT * FROM reviews WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return rows[0];
  }
}

module.exports = Review;