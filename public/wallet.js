let wallet = null;

async function connectWallet() {
    const [account] = await window.ethereum.request({
        method: "eth_requestAccounts"
    });

    wallet = account;
    document.getElementById("walletStatus").innerText =
        "Connected: " + wallet;
}

async function playGame() {
    if (!wallet) return alert("Connect wallet");

    const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{
            from: wallet,
            to: wallet,
            value: "0x0"
        }]
    });

    const res = await fetch("/game/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, txHash })
    });

    const data = await res.json();
    document.getElementById("dice").innerText = data.roll;
}
