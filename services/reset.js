import pool from "../db/index.js";

export async function weeklyReset() {
    await pool.query("UPDATE users SET xp = 0");
    console.log("Weekly XP reset completed");
}
