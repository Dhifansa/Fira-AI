
const userRepository = require("../repositories/userRepository");

const userService = {
    // Get user profile
    async getUserById(userId) {
        if (!userId) {
            throw new Error("User ID is required.");
        }

        const user = await userRepository.findById(userId);

        if (!user) {
            throw new Error("User not found.");
        }

        return user;
    },

    // Check whether email is already registered
    async checkEmailExists(email) {
        if (!email) {
            throw new Error("Email is required.");
        }

        const user = await userRepository.findByEmail(
            email.trim().toLowerCase()
        );

        return Boolean(user);
    },
};

module.exports = userService;
