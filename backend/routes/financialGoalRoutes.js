
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getFinancialGoals,
  getFinancialGoalById,
  createFinancialGoal,
  updateFinancialGoal,
  deleteFinancialGoal,
} = require("../controllers/financialGoalController");

// All routes require authentication
router.use(authMiddleware);

// GET /api/financial-goals
router.get("/", getFinancialGoals);

// GET /api/financial-goals/:id
router.get("/:id", getFinancialGoalById);

// POST /api/financial-goals
router.post("/", createFinancialGoal);

// PUT /api/financial-goals/:id
router.put("/:id", updateFinancialGoal);

// DELETE /api/financial-goals/:id
router.delete("/:id", deleteFinancialGoal);

module.exports = router;
