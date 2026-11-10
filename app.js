const pool = require("./config/database");
const express = require("express");
const cors = require("cors");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const app = express();


app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        application: "FIRA",
        message: "Financial Intelligence & Recommendation Assistant API",
        version: "1.0.0",
    });
});


app.get("/health", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                current_database() AS database,
                NOW() AS server_time
        `);

        res.status(200).json({
            success: true,
            message: "FIRA API is running.",
            database: {
                connected: true,
                name: result.rows[0].database,
                server_time: result.rows[0].server_time,
            },
        });

    } catch (error) {
        console.error("Database health check failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed.",
        });
    }
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found.",
    });
});

module.exports = app;