
const pool = require("../config/database");

const transactionRepository = {
    async findAll(userId) {
        const query = `
            SELECT
                t.transaction_id,
                t.user_id,
                t.category_id,
                c.name AS category_name,
                t.type,
                t.amount,
                t.description,
                t.transaction_date,
                t.created_at,
                t.updated_at
            FROM transactions t
            JOIN categories c
                ON c.category_id = t.category_id
                AND c.user_id = t.user_id
            WHERE t.user_id = $1
            ORDER BY t.transaction_date DESC, t.created_at DESC
        `;

        const result = await pool.query(query, [userId]);

        return result.rows;
    },

    async findById(transactionId, userId) {
        const query = `
            SELECT
                t.transaction_id,
                t.user_id,
                t.category_id,
                c.name AS category_name,
                t.type,
                t.amount,
                t.description,
                t.transaction_date,
                t.created_at,
                t.updated_at
            FROM transactions t
            JOIN categories c
                ON c.category_id = t.category_id
                AND c.user_id = t.user_id
            WHERE t.transaction_id = $1
                AND t.user_id = $2
            LIMIT 1
        `;

        const result = await pool.query(query, [
            transactionId,
            userId
        ]);

        return result.rows[0] || null;
    },

    async create(userId, data) {
        const {
            category_id,
            type,
            amount,
            description,
            transaction_date
        } = data;

        const query = `
            INSERT INTO transactions (
                user_id,
                category_id,
                type,
                amount,
                description,
                transaction_date
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await pool.query(query, [
            userId,
            category_id,
            type,
            amount,
            description || null,
            transaction_date
        ]);

        return result.rows[0];
    },

    async update(transactionId, userId, data) {
        const {
            category_id,
            type,
            amount,
            description,
            transaction_date
        } = data;

        const query = `
            UPDATE transactions
            SET
                category_id = $1,
                type = $2,
                amount = $3,
                description = $4,
                transaction_date = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE transaction_id = $6
                AND user_id = $7
            RETURNING *
        `;

        const result = await pool.query(query, [
            category_id,
            type,
            amount,
            description || null,
            transaction_date,
            transactionId,
            userId
        ]);

        return result.rows[0] || null;
    },

    async delete(transactionId, userId) {
        const query = `
            DELETE FROM transactions
            WHERE transaction_id = $1
                AND user_id = $2
            RETURNING transaction_id
        `;

        const result = await pool.query(query, [
            transactionId,
            userId
        ]);

        return result.rows[0] || null;
    }
};

module.exports = transactionRepository;
