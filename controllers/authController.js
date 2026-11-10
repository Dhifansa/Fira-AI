const authService = require("../services/authService");
const userService = require("../services/userService");

const authController = {
    // POST /api/auth/register
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            const user = await authService.register({
                name,
                email,
                password,
            });

            return res.status(201).json({
                success: true,
                message: "Registration successful.",
                data: { user },
            });
        } catch (error) {
            console.error("Register error:", error.message);

            const statusCode =
                error.message === "Email is already registered."
                    ? 409
                    : 400;

            return res.status(statusCode).json({
                success: false,
                message: error.message,
            });
        }
    },

    // POST /api/auth/login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const result = await authService.login({
                email,
                password,
            });

            return res.status(200).json({
                success: true,
                message: "Login successful.",
                data: result,
            });
        } catch (error) {
            console.error("Login error:", error.message);

            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    },

    async getMe(req, res) {
        try {
            const user = await userService.getUserById(
                req.user.user_id
            );

            return res.status(200).json({
                success: true,
                message: "User profile retrieved successfully.",
                data: { user },
            });

        } catch (error) {
            console.error("Get profile error:", error.message);

            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
    },
};

module.exports = authController;
