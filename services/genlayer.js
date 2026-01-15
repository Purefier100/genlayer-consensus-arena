import axios from "axios";

const GENLAYER_RPC = "https://genlayer-testnet.rpc.caldera.xyz/http";

export async function verifyTx(txHash) {
    try {
        const res = await axios.post(GENLAYER_RPC, {
            jsonrpc: "2.0",
            id: 1,
            method: "eth_getTransactionByHash",
            params: [txHash]
        });

        return res.data.result;
    } catch (err) {
        console.error("GenLayer RPC error", err);
        return null;
    }
}

