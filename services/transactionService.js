
const transactionRepository = require("../repositories/transactionRepository");
const categoryRepository = require("../repositories/categoryRepository");

const transactionService = {
    // GET ALL TRANSACTIONS
    async getAll(userId) {
        return transactionRepository.findAll(userId);
    },

    // GET TRANSACTION BY ID
    async getById(userId, transactionId) {
        const transaction = await transactionRepository.findById(
            transactionId,
            userId
        );

        if (!transaction) {
            const error = new Error("Transaction not found.");
            error.status = 404;
            throw error;
        }

        return transaction;
    },

    // VALIDATE TRANSACTION DATA
    async validateTransaction(userId, data) {
        const {
            category_id,
            type,
            amount,
            transaction_date
        } = data;

        if (!category_id || !type || amount === undefined || !transaction_date) {
            const error = new Error("Required transaction fields are missing.");
            error.status = 400;
            throw error;
        }

        if (!["income", "expense"].includes(type)) {
            const error = new Error("Invalid transaction type.");
            error.status = 400;
            throw error;
        }

        // Keep amount as a decimal string for PostgreSQL NUMERIC
        const normalizedAmount = String(amount).trim();

        if (!/^\d+(\.\d{1,2})?$/.test(normalizedAmount) ||
            !/[1-9]/.test(normalizedAmount)) {
            const error = new Error("Amount must be a positive value with up to 2 decimal places.");
            error.status = 400;
            throw error;
        }

        // Validate date format and calendar validity
        if (
            typeof transaction_date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(transaction_date)
        ) {
            const error = new Error("Transaction date must use YYYY-MM-DD format.");
            error.status = 400;
            throw error;
        }

        const parsedDate = new Date(`${transaction_date}T00:00:00.000Z`);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== transaction_date
        ) {
            const error = new Error("Invalid transaction date.");
            error.status = 400;
            throw error;
        }

        // Verify category ownership and type
        const category = await categoryRepository.findById(
            category_id,
            userId
        );

        if (!category) {
            const error = new Error("Category not found.");
            error.status = 404;
            throw error;
        }

        if (category.type !== type) {
            const error = new Error("Transaction type does not match category type.");
            error.status = 400;
            throw error;
        }

        return {
            category_id,
            type,
            amount: normalizedAmount,
            description: data.description?.trim() || null,
            transaction_date
        };
    },

    // CREATE TRANSACTION
    async create(userId, data) {
        const validatedData = await this.validateTransaction(
            userId,
            data
        );

        return transactionRepository.create(
            userId,
            validatedData
        );
    },

    // UPDATE TRANSACTION
    async update(userId, transactionId, data) {
        const existing = await transactionRepository.findById(
            transactionId,
            userId
        );

        if (!existing) {
            const error = new Error("Transaction not found.");
            error.status = 404;
            throw error;
        }

        const mergedData = {
            category_id: data.category_id ?? existing.category_id,
            type: data.type ?? existing.type,
            amount: data.amount ?? existing.amount,
            description: data.description ?? existing.description,
            transaction_date:
                data.transaction_date ??
                String(existing.transaction_date).slice(0, 10)
        };

        const validatedData = await this.validateTransaction(
            userId,
            mergedData
        );

        return transactionRepository.update(
            transactionId,
            userId,
            validatedData
        );
    },

    // DELETE TRANSACTION
    async delete(userId, transactionId) {
        const deleted = await transactionRepository.delete(
            transactionId,
            userId
        );

        if (!deleted) {
            const error = new Error("Transaction not found.");
            error.status = 404;
            throw error;
        }

        return deleted;
    }
};

module.exports = transactionService;
