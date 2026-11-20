const budgetService = require("../services/budgetService");

const budgetController = {
  // GET /api/budgets
  async getAll(req, res, next) {
    try {
      const userId = req.user.user_id;

      const budgets = await budgetService.getAll(userId);

      return res.status(200).json({
        success: true,
        message: "Budgets retrieved successfully.",
        data: budgets,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/budgets/:id
  async getById(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { id } = req.params;

      const budget = await budgetService.getById(userId, id);

      return res.status(200).json({
        success: true,
        message: "Budget retrieved successfully.",
        data: budget,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/budgets
  async create(req, res, next) {
    try {
      const userId = req.user.user_id;

      const budget = await budgetService.create(userId, req.body);

      return res.status(201).json({
        success: true,
        message: "Budget created successfully.",
        data: budget,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/budgets/:id
  async update(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { id } = req.params;

      const budget = await budgetService.update(
        userId,
        id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Budget updated successfully.",
        data: budget,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/budgets/:id
  async delete(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { id } = req.params;

      await budgetService.delete(userId, id);

      return res.status(200).json({
        success: true,
        message: "Budget deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = budgetController;
