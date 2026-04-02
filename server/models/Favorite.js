const db = require('../config/db');

class Favorite {
  static async add(userId, productId) {
    await db.execute(
      'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    );
  }

  static async remove(userId, productId) {
    await db.execute(
      'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
  }

  static async findByUser(userId) {
    const [rows] = await db.execute(
      'SELECT product_id FROM favorites WHERE user_id = ?',
      [userId]
    );
    return rows.map(row => row.product_id);
  }

  static async exists(userId, productId) {
    const [rows] = await db.execute(
      'SELECT 1 FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return rows.length > 0;
  }
}

module.exports = Favorite;