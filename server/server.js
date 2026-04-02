const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Маршрути
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Тестовий маршрут для перевірки
app.get('/', (req, res) => {
  res.send('Сервер працює!');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});