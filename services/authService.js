
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userRepository = require("../repositories/userRepository");

const authService = {
    // REGISTER
    async register({ name, email, password }) {
        // Validate input
        if (!name || !email || !password) {
            throw new Error("Name, email, and password are required.");
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (password.length < 8) {
            throw new Error("Password must contain at least 8 characters.");
        }

        // Check existing email
        const existingUser = await userRepository.findByEmail(
            normalizedEmail
        );

        if (existingUser) {
            throw new Error("Email is already registered.");
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await userRepository.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
        });

        return user;
    },

    // LOGIN
    async login({ email, password }) {
        if (!email || !password) {
            throw new Error("Email and password are required.");
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find user
        const user = await userRepository.findByEmail(
            normalizedEmail
        );

        if (!user) {
            throw new Error("Invalid email or password.");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            throw new Error("Invalid email or password.");
        }

        // Generate JWT
        const token = jwt.sign(
            {
                user_id: user.user_id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d",
            }
        );

        return {
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
            },
            token,
        };
    },
};

module.exports = authService;
