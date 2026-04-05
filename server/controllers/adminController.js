const db = require('../config/db');

// ========== ІСНУЮЧІ МЕТОДИ (ВАШІ) ==========
exports.getAllRecipients = async (req, res) => {
    const [rows] = await db.execute('SELECT id, name FROM recipients');
    res.json(rows);
};
exports.getAllOccasions = async (req, res) => {
    const [rows] = await db.execute('SELECT id, name FROM occasions');
    res.json(rows);
};
exports.getAllGiftTypes = async (req, res) => {
    const [rows] = await db.execute('SELECT id, name FROM gift_types');
    res.json(rows);
};
exports.getAllRelationships = async (req, res) => {
    const [rows] = await db.execute('SELECT id, name FROM relationships');
    res.json(rows);
};
exports.getAllAgeRanges = async (req, res) => {
    const [rows] = await db.execute('SELECT id, name FROM age_ranges');
    res.json(rows);
};
exports.getAllGenders = async (req, res) => {
    const [rows] = await db.execute('SELECT id, name FROM genders');
    res.json(rows);
};
exports.getAllCharacters = async (req, res) => {
    const [rows] = await db.execute('SELECT id, name FROM character_types');
    res.json(rows);
};
exports.getAllInterests = async (req, res) => {
    const [rows] = await db.execute('SELECT id, name FROM interests');
    res.json(rows);
};
exports.getAllTags = async (req, res) => {
    const [rows] = await db.execute('SELECT id, name FROM tags');
    res.json(rows);
};

exports.getProductFilters = async (req, res) => {
    const productId = req.params.productId;
    const [recipientRows] = await db.execute('SELECT recipient_id FROM product_recipient WHERE product_id = ?', [productId]);
    const [occasionRows] = await db.execute('SELECT occasion_id FROM product_occasion WHERE product_id = ?', [productId]);
    const [giftTypeRows] = await db.execute('SELECT gift_type_id FROM product_gift_type WHERE product_id = ?', [productId]);
    const [relationshipRows] = await db.execute('SELECT relationship_id FROM product_relationship WHERE product_id = ?', [productId]);
    const [ageRangeRows] = await db.execute('SELECT age_range_id FROM product_age_range WHERE product_id = ?', [productId]);
    const [genderRows] = await db.execute('SELECT gender_id FROM product_gender WHERE product_id = ?', [productId]);
    const [characterRows] = await db.execute('SELECT character_id FROM product_character WHERE product_id = ?', [productId]);
    const [interestRows] = await db.execute('SELECT interest_id FROM product_interest WHERE product_id = ?', [productId]);
    const [tagRows] = await db.execute('SELECT tag_id FROM product_tag WHERE product_id = ?', [productId]);

    res.json({
        recipient_ids: recipientRows.map(r => r.recipient_id),
        occasion_ids: occasionRows.map(r => r.occasion_id),
        gift_type_ids: giftTypeRows.map(r => r.gift_type_id),
        relationship_ids: relationshipRows.map(r => r.relationship_id),
        age_range_ids: ageRangeRows.map(r => r.age_range_id),
        gender_ids: genderRows.map(r => r.gender_id),
        character_ids: characterRows.map(r => r.character_id),
        interest_ids: interestRows.map(r => r.interest_id),
        tag_ids: tagRows.map(r => r.tag_id),
    });
};

exports.updateProductFilters = async (req, res) => {
    const productId = req.params.productId;
    const {
        recipient_ids, occasion_ids, gift_type_ids, relationship_ids,
        age_range_ids, gender_ids, character_ids, interest_ids, tag_ids
    } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        await connection.execute('DELETE FROM product_recipient WHERE product_id = ?', [productId]);
        await connection.execute('DELETE FROM product_occasion WHERE product_id = ?', [productId]);
        await connection.execute('DELETE FROM product_gift_type WHERE product_id = ?', [productId]);
        await connection.execute('DELETE FROM product_relationship WHERE product_id = ?', [productId]);
        await connection.execute('DELETE FROM product_age_range WHERE product_id = ?', [productId]);
        await connection.execute('DELETE FROM product_gender WHERE product_id = ?', [productId]);
        await connection.execute('DELETE FROM product_character WHERE product_id = ?', [productId]);
        await connection.execute('DELETE FROM product_interest WHERE product_id = ?', [productId]);
        await connection.execute('DELETE FROM product_tag WHERE product_id = ?', [productId]);

        for (const id of recipient_ids || []) await connection.execute('INSERT INTO product_recipient (product_id, recipient_id) VALUES (?, ?)', [productId, id]);
        for (const id of occasion_ids || []) await connection.execute('INSERT INTO product_occasion (product_id, occasion_id) VALUES (?, ?)', [productId, id]);
        for (const id of gift_type_ids || []) await connection.execute('INSERT INTO product_gift_type (product_id, gift_type_id) VALUES (?, ?)', [productId, id]);
        for (const id of relationship_ids || []) await connection.execute('INSERT INTO product_relationship (product_id, relationship_id) VALUES (?, ?)', [productId, id]);
        for (const id of age_range_ids || []) await connection.execute('INSERT INTO product_age_range (product_id, age_range_id) VALUES (?, ?)', [productId, id]);
        for (const id of gender_ids || []) await connection.execute('INSERT INTO product_gender (product_id, gender_id) VALUES (?, ?)', [productId, id]);
        for (const id of character_ids || []) await connection.execute('INSERT INTO product_character (product_id, character_id) VALUES (?, ?)', [productId, id]);
        for (const id of interest_ids || []) await connection.execute('INSERT INTO product_interest (product_id, interest_id) VALUES (?, ?)', [productId, id]);
        for (const id of tag_ids || []) await connection.execute('INSERT INTO product_tag (product_id, tag_id) VALUES (?, ?)', [productId, id]);

        await connection.commit();
        res.status(200).json({ message: 'Filters updated' });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// ========== НОВІ МЕТОДИ ==========
// Отримання одного товару (для редагування основних даних)
exports.getProductById = async (req, res) => {
    const id = req.params.id;
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
};

// Створення товару (основні дані + фільтри)
exports.createProduct = async (req, res) => {
    const { title, description, price, old_price, rating, image, images, link, is_active, personalization,
            recipient_ids, occasion_ids, gift_type_ids, relationship_ids, age_range_ids, gender_ids, character_ids, interest_ids, tag_ids } = req.body;
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [result] = await connection.execute(
            `INSERT INTO products (title, description, price, old_price, rating, image, images, link, is_active, personalization)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, price, old_price || null, rating || 0, image, JSON.stringify(images || []), link, is_active !== false, personalization || false]
        );
        const productId = result.insertId;

        for (const id of recipient_ids || []) await connection.execute('INSERT INTO product_recipient (product_id, recipient_id) VALUES (?, ?)', [productId, id]);
        for (const id of occasion_ids || []) await connection.execute('INSERT INTO product_occasion (product_id, occasion_id) VALUES (?, ?)', [productId, id]);
        for (const id of gift_type_ids || []) await connection.execute('INSERT INTO product_gift_type (product_id, gift_type_id) VALUES (?, ?)', [productId, id]);
        for (const id of relationship_ids || []) await connection.execute('INSERT INTO product_relationship (product_id, relationship_id) VALUES (?, ?)', [productId, id]);
        for (const id of age_range_ids || []) await connection.execute('INSERT INTO product_age_range (product_id, age_range_id) VALUES (?, ?)', [productId, id]);
        for (const id of gender_ids || []) await connection.execute('INSERT INTO product_gender (product_id, gender_id) VALUES (?, ?)', [productId, id]);
        for (const id of character_ids || []) await connection.execute('INSERT INTO product_character (product_id, character_id) VALUES (?, ?)', [productId, id]);
        for (const id of interest_ids || []) await connection.execute('INSERT INTO product_interest (product_id, interest_id) VALUES (?, ?)', [productId, id]);
        for (const id of tag_ids || []) await connection.execute('INSERT INTO product_tag (product_id, tag_id) VALUES (?, ?)', [productId, id]);

        await connection.commit();
        res.status(201).json({ id: productId });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// Оновлення основних даних товару (без фільтрів)
exports.updateProduct = async (req, res) => {
    const id = req.params.id;
    const { title, description, price, old_price, rating, image, images, link, is_active, personalization } = req.body;
    try {
        await db.execute(
            `UPDATE products SET title=?, description=?, price=?, old_price=?, rating=?, image=?, images=?, link=?, is_active=?, personalization=?
             WHERE id=?`,
            [title, description, price, old_price || null, rating || 0, image, JSON.stringify(images || []), link, is_active !== false, personalization || false, id]
        );
        res.status(200).json({ message: 'Product updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Видалення товару
exports.deleteProduct = async (req, res) => {
    const id = req.params.id;
    try {
        await db.execute('DELETE FROM products WHERE id = ?', [id]);
        res.status(200).json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Отримання всіх відгуків (для адмін-панелі)
exports.getAllReviews = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT r.*, u.name as user_name, p.title as product_title
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Видалення відгуку
exports.deleteReview = async (req, res) => {
    const id = req.params.id;
    try {
        await db.execute('DELETE FROM reviews WHERE id = ?', [id]);
        res.status(200).json({ message: 'Review deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};