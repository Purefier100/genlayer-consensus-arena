import express from "express";
import pool from "../db/index.js";

const router = express.Router();

router.post("/roll", async (req, res) => {
    try {
        const { wallet } = req.body;
        if (!wallet) return res.json({ error: "Wallet missing" });

        const roll = Math.floor(Math.random() * 6) + 1;
        const win = roll === 6;

        const user = await pool.query(
            "SELECT xp, streak, last_play FROM users WHERE wallet=$1",
            [wallet]
        );

        let xp = 0;
        let streak = 1;

        if (user.rows.length) {
            streak = user.rows[0].streak || 1;
            if (win) {
                streak++;
                xp = 10 + streak * 2;
            }
        } else if (win) {
            xp = 10;
        }

        await pool.query(`
            INSERT INTO users(wallet, xp, streak, last_play)
            VALUES ($1,$2,$3,NOW())
            ON CONFLICT (wallet)
            DO UPDATE SET
              xp = users.xp + $2,
              streak = $3,
              last_play = NOW()
        `, [wallet, xp, win ? streak : 1]);

        const leaderboard = await pool.query(`
            SELECT wallet, xp
            FROM users
            ORDER BY xp DESC
            LIMIT 10
        `);

        res.json({ roll, win, xp, streak, leaderboard: leaderboard.rows });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;


