const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');

const router = express.Router();

// Реєстрація
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: result.insertId, name, email } });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Вхід
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Отримання профілю (потрібен токен)
router.get('/me', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token required' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await db.execute('SELECT id, name, email FROM users WHERE id = ?', [decoded.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(403).json({ message: 'Invalid token' });
    }
});

// Забули пароль – демо-режим (без реальної відправки email)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            // Не розкриваємо, чи існує email, для безпеки
            return res.status(200).json({ message: 'Якщо цей email зареєстровано, ви отримаєте лист з інструкцією.' });
        }
        const userId = rows[0].id;
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 година

        await db.execute(
            'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, token, expiresAt]
        );

        const resetLink = `http://localhost:5000/reset-password.html?token=${token}`;
        console.log('\n========================================');
        console.log(`🔗 ПОСИЛАННЯ ДЛЯ ВІДНОВЛЕННЯ ПАРОЛЯ:`);
        console.log(resetLink);
        console.log('========================================\n');

        res.status(200).json({ message: 'Інструкції з відновлення пароля надіслано на ваш email (демо-режим). Перевірте консоль сервера.' });
    } catch (err) {
        console.error('Помилка forgot-password:', err);
        res.status(500).json({ message: 'Помилка сервера. Спробуйте пізніше.' });
    }
});

// Скидання пароля
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    try {
        const [rows] = await db.execute(
            'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
            [token]
        );
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Невірне або прострочене посилання' });
        }
        const reset = rows[0];
        const userId = reset.user_id;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        await db.execute('DELETE FROM password_resets WHERE token = ?', [token]);

        res.status(200).json({ message: 'Пароль успішно змінено' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

module.exports = router;