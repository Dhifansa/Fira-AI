
const budgetRepository = require("../repositories/budgetRepository");
const categoryRepository = require("../repositories/categoryRepository");

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateAmount(amount) {
  if (
    typeof amount !== "string" &&
    typeof amount !== "number"
  ) {
    throw createError("Budget amount is required.");
  }

  const value = String(amount).trim();

  // NUMERIC(18,2): maximum 16 integer digits and 2 decimals
  if (!/^\d{1,16}(\.\d{1,2})?$/.test(value)) {
    throw createError("Invalid budget amount.");
  }

  if (Number(value) <= 0) {
    throw createError("Budget amount must be greater than zero.");
  }

  return value;
}

function validateDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}

function formatDateString(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function validatePeriod(startDate, endDate) {
  if (!validateDate(startDate)) {
    throw createError("Invalid budget start date.");
  }

  if (!validateDate(endDate)) {
    throw createError("Invalid budget end date.");
  }

  if (startDate > endDate) {
    throw createError("Start date must be before or equal to end date.");
  }
}

async function validateExpenseCategory(categoryId, userId) {
  if (!categoryId) {
    throw createError("Category is required.");
  }

  const category = await categoryRepository.findById(
    categoryId,
    userId
  );

  if (!category) {
    throw createError("Category not found.", 404);
  }

  if (category.type !== "expense") {
    throw createError("Budget category must be an expense category.");
  }

  return category;
}

const budgetService = {
  async getAll(userId) {
    return await budgetRepository.findAllByUser(userId);
  },

  async getById(userId, budgetId) {
    const budget = await budgetRepository.findByIdAndUser(
      budgetId,
      userId
    );

    if (!budget) {
      throw createError("Budget not found.", 404);
    }

    return budget;
  },

  async create(userId, data) {
    const { category_id, amount, start_date, end_date } = data;

    await validateExpenseCategory(category_id, userId);

    const validatedAmount = validateAmount(amount);

    validatePeriod(start_date, end_date);

    const budget = await budgetRepository.create(userId, {
      category_id,
      amount: validatedAmount,
      start_date,
      end_date,
    });

    return await budgetRepository.findByIdAndUser(
      budget.budget_id,
      userId
    );
  },

  async update(userId, budgetId, data) {
    const existingBudget = await this.getById(userId, budgetId);

    const categoryId = data.category_id ?? existingBudget.category_id;
    const amount = data.amount ?? existingBudget.amount;
    const startDate =
      data.start_date ?? formatDateString(existingBudget.start_date);
    const endDate =
      data.end_date ?? formatDateString(existingBudget.end_date);

    await validateExpenseCategory(categoryId, userId);

    const validatedAmount = validateAmount(amount);

    validatePeriod(startDate, endDate);

    await budgetRepository.update(budgetId, userId, {
      category_id: categoryId,
      amount: validatedAmount,
      start_date: startDate,
      end_date: endDate,
    });

    return await budgetRepository.findByIdAndUser(
      budgetId,
      userId
    );
  },

  async delete(userId, budgetId) {
    const existingBudget = await this.getById(userId, budgetId);

    await budgetRepository.delete(budgetId, userId);

    return existingBudget;
  },
};

module.exports = budgetService;
