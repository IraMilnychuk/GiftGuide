const db = require('../config/db');

class Product {
  static async getAll() {
    // Отримуємо товари
    const [products] = await db.execute('SELECT * FROM products');
    
    // Отримуємо всі фільтри для всіх товарів одним запитом
    const [recipients] = await db.execute(`
      SELECT product_id, GROUP_CONCAT(recipient_id) as ids 
      FROM product_recipient GROUP BY product_id
    `);
    const [occasions] = await db.execute(`
      SELECT product_id, GROUP_CONCAT(occasion_id) as ids 
      FROM product_occasion GROUP BY product_id
    `);
    const [giftTypes] = await db.execute(`
      SELECT product_id, GROUP_CONCAT(gift_type_id) as ids 
      FROM product_gift_type GROUP BY product_id
    `);
    const [relationships] = await db.execute(`
      SELECT product_id, GROUP_CONCAT(relationship_id) as ids 
      FROM product_relationship GROUP BY product_id
    `);
    const [ageRanges] = await db.execute(`
      SELECT product_id, GROUP_CONCAT(age_range_id) as ids 
      FROM product_age_range GROUP BY product_id
    `);
    const [genders] = await db.execute(`
      SELECT product_id, GROUP_CONCAT(gender_id) as ids 
      FROM product_gender GROUP BY product_id
    `);
    const [characters] = await db.execute(`
      SELECT product_id, GROUP_CONCAT(character_id) as ids 
      FROM product_character GROUP BY product_id
    `);
    const [interests] = await db.execute(`
      SELECT product_id, GROUP_CONCAT(interest_id) as ids 
      FROM product_interest GROUP BY product_id
    `);
    const [tags] = await db.execute(`
      SELECT product_id, GROUP_CONCAT(tag_id) as ids 
      FROM product_tag GROUP BY product_id
    `);

    // Функція для створення мапи
    const toMap = (rows) => {
      const map = {};
      rows.forEach(row => {
        map[row.product_id] = row.ids ? row.ids.split(',').map(Number) : [];
      });
      return map;
    };

    const recipientMap = toMap(recipients);
    const occasionMap = toMap(occasions);
    const giftTypeMap = toMap(giftTypes);
    const relationshipMap = toMap(relationships);
    const ageRangeMap = toMap(ageRanges);
    const genderMap = toMap(genders);
    const characterMap = toMap(characters);
    const interestMap = toMap(interests);
    const tagMap = toMap(tags);

    return products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      recipient_ids: recipientMap[p.id] || [],
      occasion_ids: occasionMap[p.id] || [],
      gift_type_ids: giftTypeMap[p.id] || [],
      relationship_ids: relationshipMap[p.id] || [],
      age_range_ids: ageRangeMap[p.id] || [],
      gender_ids: genderMap[p.id] || [],
      character_ids: characterMap[p.id] || [],
      interest_ids: interestMap[p.id] || [],
      tag_ids: tagMap[p.id] || []
    }));
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const product = rows[0];
    product.images = product.images ? JSON.parse(product.images) : [];
    
    // Отримуємо фільтри для конкретного товару
    const [recipientRows] = await db.execute('SELECT recipient_id FROM product_recipient WHERE product_id = ?', [id]);
    const [occasionRows] = await db.execute('SELECT occasion_id FROM product_occasion WHERE product_id = ?', [id]);
    const [giftTypeRows] = await db.execute('SELECT gift_type_id FROM product_gift_type WHERE product_id = ?', [id]);
    const [relationshipRows] = await db.execute('SELECT relationship_id FROM product_relationship WHERE product_id = ?', [id]);
    const [ageRangeRows] = await db.execute('SELECT age_range_id FROM product_age_range WHERE product_id = ?', [id]);
    const [genderRows] = await db.execute('SELECT gender_id FROM product_gender WHERE product_id = ?', [id]);
    const [characterRows] = await db.execute('SELECT character_id FROM product_character WHERE product_id = ?', [id]);
    const [interestRows] = await db.execute('SELECT interest_id FROM product_interest WHERE product_id = ?', [id]);
    const [tagRows] = await db.execute('SELECT tag_id FROM product_tag WHERE product_id = ?', [id]);

    product.recipient_ids = recipientRows.map(r => r.recipient_id);
    product.occasion_ids = occasionRows.map(r => r.occasion_id);
    product.gift_type_ids = giftTypeRows.map(r => r.gift_type_id);
    product.relationship_ids = relationshipRows.map(r => r.relationship_id);
    product.age_range_ids = ageRangeRows.map(r => r.age_range_id);
    product.gender_ids = genderRows.map(r => r.gender_id);
    product.character_ids = characterRows.map(r => r.character_id);
    product.interest_ids = interestRows.map(r => r.interest_id);
    product.tag_ids = tagRows.map(r => r.tag_id);
    
    return product;
  }
}

module.exports = Product;