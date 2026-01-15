// ---------------- GLOBAL ----------------
window.walletAddress = null;

// ✅ GenLayer Dice Unlimited Contract
const GENLAYER_DICE_CONTRACT = "0x998af6F025911CbaBC7dBF827cEa978afC193519";

const DICE_ABI = [
    "function rollDice() external returns (uint8)"
];

// ---------------- DOM ELEMENTS ----------------
const diceDisplay = document.getElementById("diceDisplay");
const leaderboardList = document.getElementById("leaderboardList");
const resultMessage = document.getElementById("resultMessage");
const cooldownTimer = document.getElementById("cooldownTimer");
const timeLeftSpan = document.getElementById("timeLeft");

// 🎵 AUDIO
const bgMusic = document.getElementById("bgMusic");
const rollSound = document.getElementById("rollSound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");

// 🎵 MUSIC TOGGLE BUTTON
const musicBtn = document.getElementById("musicToggle");
let musicOn = false;

// 🔊 Volume tuning
if (bgMusic) {
    bgMusic.volume = 0.25;
    bgMusic.muted = true; // 🔑 REQUIRED FOR BROWSER
}
if (rollSound) rollSound.volume = 0.8;
if (winSound) winSound.volume = 1.0;
if (loseSound) loseSound.volume = 0.8;

// ⏱️ Frontend cooldown only
const COOLDOWN_MS = 60 * 1000;
let lastRollTime = 0;
let timerInterval = null;

// ---------------- 🎵 MUSIC TOGGLE (FIXED) ----------------
if (musicBtn && bgMusic) {
    musicBtn.addEventListener("click", async () => {
        try {
            if (!musicOn) {
                bgMusic.muted = false;
                await bgMusic.play(); // 🔓 unlock audio
                musicOn = true;
                musicBtn.innerText = "🔈 Music: ON";
            } else {
                bgMusic.pause();
                bgMusic.muted = true;
                musicOn = false;
                musicBtn.innerText = "🔊 Music: OFF";
            }
        } catch (err) {
            console.warn("Music blocked:", err);
        }
    });
}

// ---------------- WALLET ----------------
async function connectWallet() {
    if (!window.ethereum) {
        alert("Install MetaMask or Rabby");
        return;
    }

    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
    });

    window.walletAddress = accounts[0];
    document.getElementById("walletStatus").innerText =
        `Connected: ${window.walletAddress}`;
}

// ---------------- GAME ----------------
async function playGame() {
    if (!window.walletAddress) {
        showError("Connect wallet first");
        return;
    }

    const now = Date.now();
    if (now - lastRollTime < COOLDOWN_MS) {
        startCooldown(COOLDOWN_MS - (now - lastRollTime));
        return;
    }

    // 🎲 UI + sound
    diceDisplay.classList.add("shake");
    rollSound?.play().catch(() => { });

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const iface = new ethers.Interface(DICE_ABI);
        const data = iface.encodeFunctionData("rollDice");

        const tx = await signer.sendTransaction({
            to: GENLAYER_DICE_CONTRACT,
            data,
            gasLimit: 500_000
        });

        lastRollTime = Date.now();
        startCooldown(COOLDOWN_MS);

        await tx.wait();

        const res = await fetch("/game/roll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                wallet: window.walletAddress,
                txHash: tx.hash
            })
        });

        const dataRes = await res.json();

        diceDisplay.classList.remove("shake");
        await animateDice(dataRes.roll);

        if (dataRes.roll === 6) {
            resultMessage.className = "result win";
            resultMessage.innerText = "🎉 YOU WIN! +10 XP";
            winSound?.play().catch(() => { });
        } else {
            resultMessage.className = "result lose";
            resultMessage.innerText = "❌ Not a 6. Roll again!";
            loseSound?.play().catch(() => { });
        }

        renderLeaderboard(dataRes.leaderboard);

    } catch (err) {
        diceDisplay.classList.remove("shake");
        console.error("TX ERROR:", err);

        if (err.code === 4001) {
            showError("Transaction cancelled");
        } else {
            showError("Transaction failed. Check network & balance.");
        }
    }
}

// ---------------- TIMER ----------------
function startCooldown(ms) {
    clearInterval(timerInterval);
    cooldownTimer.classList.remove("hidden");

    let remaining = Math.ceil(ms / 1000);
    updateTimerText(remaining);

    timerInterval = setInterval(() => {
        remaining--;
        updateTimerText(remaining);

        if (remaining <= 0) {
            clearInterval(timerInterval);
            cooldownTimer.classList.add("hidden");
            resultMessage.innerText = "🎲 You can roll again!";
        }
    }, 1000);
}

function updateTimerText(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    timeLeftSpan.innerText = `${m}:${s}`;
}

// ---------------- DICE ----------------
function animateDice(finalRoll) {
    const faces = "⚀⚁⚂⚃⚄⚅";
    return new Promise(resolve => {
        let i = 0;
        const interval = setInterval(() => {
            diceDisplay.innerText = faces[Math.floor(Math.random() * 6)];
            if (++i > 12) {
                clearInterval(interval);
                diceDisplay.innerText = faces[finalRoll - 1];
                resolve();
            }
        }, 80);
    });
}

// ---------------- LEADERBOARD ----------------
function renderLeaderboard(players) {
    leaderboardList.innerHTML = "";
    players.forEach((p, i) => {
        const li = document.createElement("li");
        li.innerText = `${i + 1}. ${p.wallet.slice(0, 6)}… — ${p.xp} XP`;
        leaderboardList.appendChild(li);
    });
}

// ---------------- ERROR ----------------
function showError(msg) {
    resultMessage.className = "result lose";
    resultMessage.innerText = msg;
}

