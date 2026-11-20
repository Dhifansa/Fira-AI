
const express = require("express");
const router = express.Router();

const budgetController = require("../controllers/budgetController");
const authMiddleware = require("../middleware/authMiddleware");

// All budget endpoints require authentication
router.use(authMiddleware);

// GET /api/budgets
router.get("/", budgetController.getAll);

// GET /api/budgets/:id
router.get("/:id", budgetController.getById);

// POST /api/budgets
router.post("/", budgetController.create);

// PUT /api/budgets/:id
router.put("/:id", budgetController.update);

// DELETE /api/budgets/:id
router.delete("/:id", budgetController.delete);

module.exports = router;
