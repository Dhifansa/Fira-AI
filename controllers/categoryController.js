
const categoryService = require("../services/categoryService");

const handleError = (res, error) => {
    const status = error.status ||
        (error.code === "23505" ? 409 :
         error.code === "23503" ? 409 :
         error.code === "22P02" ? 400 : 500);

    return res.status(status).json({
        success: false,
        message: status === 500
            ? "Internal server error."
            : error.code === "23505"
            ? "Category already exists."
            : error.code === "23503"
            ? "Category is referenced by another record."
            : error.code === "22P02"
            ? "Invalid category ID."
            : error.message
    });
};

const categoryController = {
    async getAll(req, res) {
        try {
            const categories = await categoryService.getAll(
                req.user.user_id
            );

            return res.status(200).json({
                success: true,
                data: { categories }
            });
        } catch (error) {
            return handleError(res, error);
        }
    },

    async create(req, res) {
        try {
            const category = await categoryService.create(
                req.user.user_id, req.body || {}
            );

            return res.status(201).json({
                success: true,
                data: { category }
            });
        } catch (error) {
            return handleError(res, error);
        }
    },

    async update(req, res) {
        try {
            const category = await categoryService.update(
                req.user.user_id,
                req.params.id,
                req.body || {}
            );

            return res.status(200).json({
                success: true,
                data: { category }
            });
        } catch (error) {
            return handleError(res, error);
        }
    },

    async delete(req, res) {
        try {
            await categoryService.delete(
                req.user.user_id,
                req.params.id
            );

            return res.status(200).json({
                success: true,
                message: "Category deleted successfully."
            });
        } catch (error) {
            return handleError(res, error);
        }
    }
};

module.exports = categoryController;
