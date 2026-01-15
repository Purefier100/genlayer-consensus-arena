import pool from "./db/index.js";

const test = async () => {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Connected to Postgres:", res.rows[0]);
    process.exit();
};

test();
