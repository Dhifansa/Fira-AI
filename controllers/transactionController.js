
const transactionService = require("../services/transactionService");

const handleError = (res, error) => {
    const statusCode =
        error.status ||
        (error.code === "23503" ? 409 :
         error.code === "23505" ? 409 :
         error.code === "22P02" ? 400 : 500);

    console.error("Transaction error:", error);

    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500
            ? "Internal server error."
            : error.code === "23503"
            ? "Invalid category reference."
            : error.code === "23505"
            ? "Transaction already exists."
            : error.code === "22P02"
            ? "Invalid transaction ID."
            : error.message,
    });
};

const transactionController = {
    // GET ALL TRANSACTIONS
    async getAll(req, res) {
        try {
            const transactions = await transactionService.getAll(
                req.user.user_id
            );

            return res.status(200).json({
                success: true,
                data: { transactions },
            });
        } catch (error) {
            return handleError(res, error);
        }
    },

    // GET TRANSACTION BY ID
    async getById(req, res) {
        try {
            const transaction = await transactionService.getById(
                req.user.user_id,
                req.params.id
            );

            return res.status(200).json({
                success: true,
                data: { transaction },
            });
        } catch (error) {
            return handleError(res, error);
        }
    },

    // CREATE TRANSACTION
    async create(req, res) {
        try {
            const transaction = await transactionService.create(
                req.user.user_id,
                req.body || {}
            );

            return res.status(201).json({
                success: true,
                message: "Transaction created successfully.",
                data: { transaction },
            });
        } catch (error) {
            return handleError(res, error);
        }
    },

    // UPDATE TRANSACTION
    async update(req, res) {
        try {
            const transaction = await transactionService.update(
                req.user.user_id,
                req.params.id,
                req.body || {}
            );

            return res.status(200).json({
                success: true,
                message: "Transaction updated successfully.",
                data: { transaction },
            });
        } catch (error) {
            return handleError(res, error);
        }
    },

    // DELETE TRANSACTION
    async delete(req, res) {
        try {
            await transactionService.delete(
                req.user.user_id,
                req.params.id
            );

            return res.status(200).json({
                success: true,
                message: "Transaction deleted successfully.",
            });
        } catch (error) {
            return handleError(res, error);
        }
    },
};

module.exports = transactionController;
