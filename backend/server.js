require("dotenv").config();

const app = require("./app");
const pool = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await pool.query("SELECT 1");

        console.log("PostgreSQL connected successfully!");

        const server = app.listen(PORT, () => {
            console.log(`FIRA API running at http://localhost:${PORT}`);
        });

        const shutdown = async () => {
            console.log("Shutting down FIRA API...");

            server.close(async () => {
                await pool.end();
                console.log("PostgreSQL connection pool closed.");
                process.exit(0);
            });
        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

    } catch (error) {
        const errorDetail =
            error.code === "ECONNREFUSED"
                ? `Connection refused at ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 5432}. Pastikan service PostgreSQL sudah berjalan.`
                : error.message || error.code || String(error);

        console.error("Failed to start FIRA API:", errorDetail);
        await pool.end();
        process.exit(1);
    }
};

startServer();