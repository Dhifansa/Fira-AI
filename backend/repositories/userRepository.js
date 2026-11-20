
const pool = require("../config/database");

const userRepository = {
    // Find user by email
    async findByEmail(email) {
        const query = `
            SELECT
                user_id,
                name,
                email,
                password_hash,
                created_at,
                updated_at
            FROM users
            WHERE email = $1
            LIMIT 1
        `;

        const result = await pool.query(query, [email]);

        return result.rows[0] || null;
    },

    // Find user by ID
    async findById(userId) {
        const query = `
            SELECT
                user_id,
                name,
                email,
                created_at,
                updated_at
            FROM users
            WHERE user_id = $1
            LIMIT 1
        `;

        const result = await pool.query(query, [userId]);

        return result.rows[0] || null;
    },

    // Create new user
    async create({ name, email, passwordHash }) {
        const query = `
            INSERT INTO users (
                name,
                email,
                password_hash
            )
            VALUES ($1, $2, $3)
            RETURNING
                user_id,
                name,
                email,
                created_at,
                updated_at
        `;

        const values = [name, email, passwordHash];

        const result = await pool.query(query, values);

        return result.rows[0];
    },
};

module.exports = userRepository;
