import express from "express";
import pool from "../db/index.js";

const router = express.Router();

router.post("/roll", async (req, res) => {
    try {
        const { wallet, txHash } = req.body;

        // Wallet required
        if (!wallet) {
            return res.status(400).json({ error: "Wallet required" });
        }

        // Transaction required (GenLayer proof)
        if (!txHash) {
            return res.status(400).json({ error: "Transaction required" });
        }

        const walletAddr = wallet.toLowerCase();

        // Ensure user exists
        await pool.query(
            `
      INSERT INTO users (wallet, xp)
      VALUES ($1, 0)
      ON CONFLICT (wallet) DO NOTHING
      `,
            [walletAddr]
        );

        // Anti-spam cooldown (10 seconds)
        const lastPlayRes = await pool.query(
            "SELECT last_played FROM users WHERE wallet = $1",
            [walletAddr]
        );

        if (lastPlayRes.rows.length > 0 && lastPlayRes.rows[0].last_played) {
            const lastPlayed = new Date(lastPlayRes.rows[0].last_played).getTime();
            const now = Date.now();

            if (now - lastPlayed < 10000) {
                return res.status(429).json({
                    error: "⏳ Wait 10 seconds before rolling again"
                });
            }
        }

        // 🎲 Dice roll
        const roll = Math.floor(Math.random() * 6) + 1;
        const win = roll === 6;
        const xpEarned = win ? 10 : 0;

        // Reward XP if win
        if (win) {
            await pool.query(
                "UPDATE users SET xp = xp + 10 WHERE wallet = $1",
                [walletAddr]
            );
        }

        // Update last played time
        await pool.query(
            "UPDATE users SET last_played = NOW() WHERE wallet = $1",
            [walletAddr]
        );

        // Log transaction (GenLayer validation proof)
        await pool.query(
            "INSERT INTO tx_logs (wallet, tx_hash) VALUES ($1, $2)",
            [walletAddr, txHash]
        );

        // Fetch leaderboard
        const leaderboardRes = await pool.query(
            "SELECT wallet, xp FROM users ORDER BY xp DESC LIMIT 10"
        );

        // Respond
        res.json({
            roll,
            win,
            xp: xpEarned,
            leaderboard: leaderboardRes.rows
        });

    } catch (err) {
        console.error("Game error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;

