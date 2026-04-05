const db = require('../config/db');

exports.getFavorites = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute(
            'SELECT product_id FROM favorites WHERE user_id = ?',
            [userId]
        );
        const favorites = rows.map(row => row.product_id);
        res.json({ favorites });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.addFavorite = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });
    try {
        await db.execute('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', [userId, productId]);
        res.status(201).json({ message: 'Favorite added' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Already favorite' });
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.removeFavorite = async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.productId;
    try {
        await db.execute('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
        res.status(200).json({ message: 'Favorite removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.addRating = async (req, res) => {
    const userId = req.user.id;
    const { productId, rating } = req.body;
    if (!productId || rating === undefined) return res.status(400).json({ message: 'productId and rating required' });
    try {
        await db.execute(
            `INSERT INTO ratings (user_id, product_id, rating)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
            [userId, productId, rating]
        );
        const [avgRows] = await db.execute('SELECT AVG(rating) as average FROM ratings WHERE product_id = ?', [productId]);
        const average = parseFloat(avgRows[0].average).toFixed(1);
        res.status(200).json({ average });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getProductReviews = async (req, res) => {
    const productId = req.params.productId;
    try {
        const [rows] = await db.execute(
            `SELECT r.*, u.name as user_name
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC`,
            [productId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.addReview = async (req, res) => {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;
    if (!productId || rating === undefined) return res.status(400).json({ message: 'productId and rating required' });
    try {
        await db.execute(
            `INSERT INTO reviews (user_id, product_id, rating, comment)
             VALUES (?, ?, ?, ?)`,
            [userId, productId, rating, comment || null]
        );
        res.status(201).json({ message: 'Review added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};