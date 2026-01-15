import express from "express";
import pool from "../db/index.js";

const router = express.Router();

// Challenge a roll
router.post("/challenge", async (req, res) => {
    const { wallet, roll } = req.body;

    await pool.query(
        "INSERT INTO challenges(wallet, roll) VALUES($1,$2)",
        [wallet, roll]
    );

    res.json({ message: "Challenge submitted. Awaiting consensus." });
});

// Resolve challenge (admin / DAO logic)
router.post("/resolve", async (req, res) => {
    const { challengeId, accepted } = req.body;

    const challenge = await pool.query(
        "SELECT * FROM challenges WHERE id=$1",
        [challengeId]
    );

    if (!challenge.rows.length) {
        return res.status(404).json({ error: "Challenge not found" });
    }

    if (!accepted) {
        await pool.query(
            "UPDATE users SET xp = GREATEST(xp - 10, 0) WHERE wallet=$1",
            [challenge.rows[0].wallet]
        );
    }

    await pool.query(
        "UPDATE challenges SET status='resolved' WHERE id=$1",
        [challengeId]
    );

    res.json({ success: true });
});

export default router;
