
const pool = require("../config/database");

const categoryRepository = {
    async findAll(userId) {
        const result = await pool.query(
            `SELECT category_id, name, type
             FROM categories
             WHERE user_id = $1
             ORDER BY type, name`,
            [userId]
        );

        return result.rows;
    },

    async findById(categoryId, userId) {
        const result = await pool.query(
            `SELECT category_id, name, type
             FROM categories
             WHERE category_id = $1 AND user_id = $2`,
            [categoryId, userId]
        );

        return result.rows[0] || null;
    },

    async create(userId, name, type) {
        const result = await pool.query(
            `INSERT INTO categories (user_id, name, type)
             VALUES ($1, $2, $3)
             RETURNING category_id, name, type`,
            [userId, name, type]
        );

        return result.rows[0];
    },

    async update(categoryId, userId, name, type) {
        const result = await pool.query(
            `UPDATE categories
             SET name = $1, type = $2
             WHERE category_id = $3 AND user_id = $4
             RETURNING category_id, name, type`,
            [name, type, categoryId, userId]
        );

        return result.rows[0] || null;
    },

    async delete(categoryId, userId) {
        const result = await pool.query(
            `DELETE FROM categories
             WHERE category_id = $1 AND user_id = $2
             RETURNING category_id`,
            [categoryId, userId]
        );

        return result.rows[0] || null;
    }
};

module.exports = categoryRepository;
