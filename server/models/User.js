const db = require('../config/db');

class User {
  static async create({ name, email, hashedPassword, birthDate = null }) {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, birth_date) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, birthDate]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT id, name, email, role, birth_date, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = User;