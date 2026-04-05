const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../config/db');

exports.register = async (req, res) => {
  const { name, email, password, birthDate } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists.' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await User.create({ name, email, hashedPassword, birthDate });
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: userId, name, email, role: 'user' } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Налаштування транспортера (один раз)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true для 465, false для 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(200).json({ message: 'Якщо цей email зареєстровано, ви отримаєте лист з інструкцією.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 3600000); // 1 година

  await db.execute(
    'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, token, expiresAt]
  );

  const resetLink = `http://localhost:5000/reset-password.html?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"GiftGuide" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Відновлення пароля',
      html: `
        <h2>Відновлення пароля GiftGuide</h2>
        <p>Ви отримали цей лист, тому що хтось (можливо ви) запросив відновлення пароля.</p>
        <p>Перейдіть за посиланням нижче, щоб встановити новий пароль:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Посилання дійсне протягом 1 години.</p>
        <p>Якщо ви не робили цього запиту, проігноруйте цей лист.</p>
      `,
    });
    res.status(200).json({ message: 'Якщо цей email зареєстровано, ви отримаєте лист з інструкцією.' });
  } catch (err) {
    console.error('Email sending error:', err);
    res.status(500).json({ message: 'Помилка надсилання листа. Спробуйте пізніше.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

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
};