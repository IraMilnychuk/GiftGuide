const db = require('../config/db');

class Product {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM products');
    // Парсимо JSON-поля (images)
    return rows.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : []
    }));
  }
}

module.exports = Product;