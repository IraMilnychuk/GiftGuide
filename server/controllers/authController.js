const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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