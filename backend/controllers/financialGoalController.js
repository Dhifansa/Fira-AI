
const pool = require("../config/database");

const VALID_STATUSES = ["active", "completed", "cancelled"];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ============================================
// HELPER FUNCTIONS
// ============================================

function isValidDate(value) {
  if (typeof value !== "string") return false;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function formatDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function validateGoalPayload(payload, partial = false) {
  const errors = [];

  const allowedFields = [
    "name",
    "target_amount",
    "start_date",
    "end_date",
    "status",
  ];

  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    return ["Request body must be a valid object."];
  }

  for (const key of Object.keys(payload)) {
    if (!allowedFields.includes(key)) {
      errors.push(`Field '${key}' is not allowed.`);
    }
  }

  // Validate name
  if (!partial || payload.name !== undefined) {
    if (
      typeof payload.name !== "string" ||
      !payload.name.trim() ||
      payload.name.trim().length > 150
    ) {
      errors.push(
        "Name is required and must not exceed 150 characters."
      );
    }
  }

  // Validate target amount
  if (!partial || payload.target_amount !== undefined) {
    const amount = Number(payload.target_amount);

    if (
      payload.target_amount === "" ||
      payload.target_amount === null ||
      payload.target_amount === undefined ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      errors.push("Target amount must be greater than zero.");
    }
  }

  // Validate start date
  if (!partial || payload.start_date !== undefined) {
    if (!isValidDate(payload.start_date)) {
      errors.push("Start date must be a valid YYYY-MM-DD date.");
    }
  }

  // Validate end date
  if (!partial || payload.end_date !== undefined) {
    if (!isValidDate(payload.end_date)) {
      errors.push("End date must be a valid YYYY-MM-DD date.");
    }
  }

  // Validate status
  if (payload.status !== undefined) {
    if (!VALID_STATUSES.includes(payload.status)) {
      errors.push(
        "Status must be active, completed, or cancelled."
      );
    }
  }

  return errors;
}

function sendError(res, error, message) {
  console.error(message, error);

  if (error.code === "23514") {
    return res.status(400).json({
      success: false,
      message: "Input violates a database constraint.",
    });
  }

  if (error.code === "22P02") {
    return res.status(400).json({
      success: false,
      message: "Invalid data format.",
    });
  }

  return res.status(500).json({
    success: false,
    message,
  });
}

// ============================================
// GET ALL FINANCIAL GOALS
// GET /api/financial-goals
// ============================================

exports.getFinancialGoals = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await pool.query(
      `
      SELECT
        financial_goal_id,
        user_id,
        name,
        target_amount,
        start_date,
        end_date,
        status,
        created_at
      FROM financial_goals
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Financial goals retrieved successfully.",
      data: result.rows,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to retrieve financial goals."
    );
  }
};

// ============================================
// GET FINANCIAL GOAL BY ID
// GET /api/financial-goals/:id
// ============================================

exports.getFinancialGoalById = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid financial goal ID.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        financial_goal_id,
        user_id,
        name,
        target_amount,
        start_date,
        end_date,
        status,
        created_at
      FROM financial_goals
      WHERE financial_goal_id = $1
        AND user_id = $2
      LIMIT 1
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Financial goal not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Financial goal retrieved successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to retrieve financial goal."
    );
  }
};

// ============================================
// CREATE FINANCIAL GOAL
// POST /api/financial-goals
// ============================================

exports.createFinancialGoal = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const {
      name,
      target_amount,
      start_date,
      end_date,
      status = "active",
    } = req.body;

    const payload = {
      name,
      target_amount,
      start_date,
      end_date,
      status,
    };

    const errors = validateGoalPayload(payload);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    if (start_date > end_date) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be later than end date.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO financial_goals (
        user_id,
        name,
        target_amount,
        start_date,
        end_date,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        financial_goal_id,
        user_id,
        name,
        target_amount,
        start_date,
        end_date,
        status,
        created_at
      `,
      [
        userId,
        name.trim(),
        String(target_amount),
        start_date,
        end_date,
        status,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Financial goal created successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to create financial goal."
    );
  }
};

// ============================================
// UPDATE FINANCIAL GOAL
// PUT /api/financial-goals/:id
// ============================================

exports.updateFinancialGoal = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;
    const payload = req.body;

    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid financial goal ID.",
      });
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a valid object.",
      });
    }

    const fields = Object.keys(payload);

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required for update.",
      });
    }

    const errors = validateGoalPayload(payload, true);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    // Find existing goal owned by current user
    const existing = await pool.query(
      `
      SELECT
        financial_goal_id,
        name,
        target_amount,
        start_date,
        end_date,
        status
      FROM financial_goals
      WHERE financial_goal_id = $1
        AND user_id = $2
      LIMIT 1
      `,
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Financial goal not found.",
      });
    }

    const current = existing.rows[0];

    // Merge existing data with updated payload
    const updated = {
      name:
        payload.name !== undefined
          ? payload.name.trim()
          : current.name,

      target_amount:
        payload.target_amount !== undefined
          ? String(payload.target_amount)
          : String(current.target_amount),

      start_date:
        payload.start_date !== undefined
          ? payload.start_date
          : formatDate(current.start_date),

      end_date:
        payload.end_date !== undefined
          ? payload.end_date
          : formatDate(current.end_date),

      status:
        payload.status !== undefined
          ? payload.status
          : current.status,
    };

    // Validate date range
    if (updated.start_date > updated.end_date) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be later than end date.",
      });
    }

    const result = await pool.query(
      `
      UPDATE financial_goals
      SET
        name = $1,
        target_amount = $2,
        start_date = $3,
        end_date = $4,
        status = $5
      WHERE financial_goal_id = $6
        AND user_id = $7
      RETURNING
        financial_goal_id,
        user_id,
        name,
        target_amount,
        start_date,
        end_date,
        status,
        created_at
      `,
      [
        updated.name,
        updated.target_amount,
        updated.start_date,
        updated.end_date,
        updated.status,
        id,
        userId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Financial goal updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to update financial goal."
    );
  }
};

// ============================================
// DELETE FINANCIAL GOAL
// DELETE /api/financial-goals/:id
// ============================================

exports.deleteFinancialGoal = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid financial goal ID.",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM financial_goals
      WHERE financial_goal_id = $1
        AND user_id = $2
      RETURNING financial_goal_id
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Financial goal not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Financial goal deleted successfully.",
      data: {
        financial_goal_id: result.rows[0].financial_goal_id,
      },
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to delete financial goal."
    );
  }
};
