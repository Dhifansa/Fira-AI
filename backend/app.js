const pool = require("./config/database");
const express = require("express");
const cors = require("cors");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const app = express();
const financialGoalRoutes = require("./routes/financialGoalRoutes");
const aiRoutes = require("./routes/aiRoutes");

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/+$/, "");
        if (
            allowedOrigins.includes(normalizedOrigin) ||
            normalizedOrigin === "http://localhost:3000" ||
            normalizedOrigin.endsWith(".vercel.app")
        ) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/financial-goals", financialGoalRoutes);
app.use("/api/ai", aiRoutes);

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

app.use((err, req, res, next) => {
    console.error("Unhandled API error:", err);

    const statusCode =
        err.status ||
        (err.code === "23505" || err.code === "23503" ? 409 :
         err.code === "22P02" || err.code === "23514" ? 400 : 500);

    const message =
        statusCode === 500
            ? "Internal server error."
            : err.code === "22P02"
            ? "Invalid ID or data format."
            : err.code === "23503"
            ? "Referenced record does not exist or is in use."
            : err.code === "23505"
            ? "Record already exists."
            : err.message || "Request failed.";

    return res.status(statusCode).json({
        success: false,
        message,
    });
});

module.exports = app;