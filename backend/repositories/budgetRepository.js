
const pool = require("../config/database");

const budgetRepository = {
  // Get all budgets with spending progress
  async findAllByUser(userId) {
    const query = `
      SELECT
        b.budget_id,
        b.user_id,
        b.category_id,
        c.name AS category_name,
        b.amount::text AS amount,
        b.start_date,
        b.end_date,
        COALESCE(
          (
            SELECT SUM(t.amount)
            FROM transactions t
            WHERE t.user_id = b.user_id
              AND t.category_id = b.category_id
              AND t.type = 'expense'
              AND t.transaction_date >= b.start_date
              AND t.transaction_date <= b.end_date
          ),
          0
        )::text AS spent
      FROM budgets b
      JOIN categories c
        ON c.category_id = b.category_id
        AND c.user_id = b.user_id
      WHERE b.user_id = $1
      ORDER BY b.start_date DESC;
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // Get budget by ID
  async findByIdAndUser(budgetId, userId) {
    const query = `
      SELECT
        b.budget_id,
        b.user_id,
        b.category_id,
        c.name AS category_name,
        b.amount::text AS amount,
        b.start_date,
        b.end_date,
        COALESCE(
          (
            SELECT SUM(t.amount)
            FROM transactions t
            WHERE t.user_id = b.user_id
              AND t.category_id = b.category_id
              AND t.type = 'expense'
              AND t.transaction_date >= b.start_date
              AND t.transaction_date <= b.end_date
          ),
          0
        )::text AS spent
      FROM budgets b
      JOIN categories c
        ON c.category_id = b.category_id
        AND c.user_id = b.user_id
      WHERE b.budget_id = $1
        AND b.user_id = $2;
    `;

    const result = await pool.query(query, [budgetId, userId]);
    return result.rows[0] || null;
  },

  // Create budget
  async create(userId, data) {
    const { category_id, amount, start_date, end_date } = data;

    const query = `
      INSERT INTO budgets (
        user_id,
        category_id,
        amount,
        start_date,
        end_date
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      userId,
      category_id,
      amount,
      start_date,
      end_date,
    ]);

    return result.rows[0];
  },

  // Update budget
  async update(budgetId, userId, data) {
    const { category_id, amount, start_date, end_date } = data;

    const query = `
      UPDATE budgets
      SET
        category_id = $1,
        amount = $2,
        start_date = $3,
        end_date = $4
      WHERE budget_id = $5
        AND user_id = $6
      RETURNING *;
    `;

    const result = await pool.query(query, [
      category_id,
      amount,
      start_date,
      end_date,
      budgetId,
      userId,
    ]);

    return result.rows[0] || null;
  },

  // Delete budget
  async delete(budgetId, userId) {
    const query = `
      DELETE FROM budgets
      WHERE budget_id = $1
        AND user_id = $2
      RETURNING budget_id;
    `;

    const result = await pool.query(query, [budgetId, userId]);
    return result.rows[0] || null;
  },
};

module.exports = budgetRepository;
