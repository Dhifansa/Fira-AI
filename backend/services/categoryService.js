
const categoryRepository = require("../repositories/categoryRepository");

const DEFAULT_CATEGORIES = [
    { name: "Makanan & Minuman", type: "expense" },
    { name: "Transportasi", type: "expense" },
    { name: "Rumah & Utilitas", type: "expense" },
    { name: "Hiburan & Gaya Hidup", type: "expense" },
    { name: "Kesehatan & Fitnes", type: "expense" },
    { name: "Edukasi & Buku", type: "expense" },
    { name: "Kebutuhan Pokok", type: "expense" },
    { name: "Belanja & Retail", type: "expense" },
    { name: "Tagihan & Utilitas", type: "expense" },
    { name: "Penghasilan Tetap", type: "income" },
    { name: "Pendapatan Bisnis", type: "income" },
    { name: "Pendapatan Sampingan", type: "income" },
    { name: "Investasi & Lainnya", type: "income" },
];

const categoryService = {
    async getAll(userId) {
        const existing = await categoryRepository.findAll(userId);
        if (existing.length === 0) {
            return categoryRepository.seedDefaults(userId, DEFAULT_CATEGORIES);
        }
        return existing;
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
