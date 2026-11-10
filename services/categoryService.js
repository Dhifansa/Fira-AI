
const categoryRepository = require("../repositories/categoryRepository");

const categoryService = {
    async getAll(userId) {
        return categoryRepository.findAll(userId);
    },

    async create(userId, { name, type }) {
        if (typeof name !== "string" || !name.trim()) {
            const error = new Error("Category name is required.");
            error.status = 400;
            throw error;
        }

        if (!["income", "expense"].includes(type)) {
            const error = new Error("Invalid category type.");
            error.status = 400;
            throw error;
        }

        return categoryRepository.create(userId, name.trim(), type);
    },

    async update(userId, categoryId, data) {
        const existing = await categoryRepository.findById(
            categoryId, userId
        );

        if (!existing) {
            const error = new Error("Category not found.");
            error.status = 404;
            throw error;
        }

        const name = data.name ?? existing.name;
        const type = data.type ?? existing.type;

        if (typeof name !== "string" || !name.trim()) {
            const error = new Error("Invalid category name.");
            error.status = 400;
            throw error;
        }

        if (!["income", "expense"].includes(type)) {
            const error = new Error("Invalid category type.");
            error.status = 400;
            throw error;
        }

        return categoryRepository.update(
            categoryId, userId, name.trim(), type
        );
    },

    async delete(userId, categoryId) {
        const deleted = await categoryRepository.delete(
            categoryId, userId
        );

        if (!deleted) {
            const error = new Error("Category not found.");
            error.status = 404;
            throw error;
        }

        return deleted;
    }
};

module.exports = categoryService;
