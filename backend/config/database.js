const { Pool } = require("pg");

const isUsingConnectionString = Boolean(process.env.DATABASE_URL);
const useSsl =
    process.env.DB_SSL === "true" ||
    (isUsingConnectionString && !process.env.DATABASE_URL.includes("localhost") && !process.env.DATABASE_URL.includes("127.0.0.1"));

const pool = new Pool(
    isUsingConnectionString
        ? {
              connectionString: process.env.DATABASE_URL,
              ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
          }
        : {
              host: process.env.DB_HOST,
              port: Number(process.env.DB_PORT) || 5432,
              database: process.env.DB_NAME,
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
          }
);

pool.on("connect", () => {
    console.log("PostgreSQL client connected.");
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL error:", error);
});

module.exports = pool;