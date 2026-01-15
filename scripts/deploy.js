import { ethers } from "ethers";
import "dotenv/config";
import fs from "fs";
import path from "path";

// ✅ GenLayer Testnet RPC
const RPC_URL = "https://genlayer-testnet.rpc.caldera.xyz/http";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const wallet = new ethers.Wallet(
        process.env.PRIVATE_KEY,
        provider
    );

    console.log("Deploying with:", wallet.address);

    const artifactPath = path.resolve(
        "artifacts/contracts/GenLayerDiceUnlimited.sol/GenLayerDiceUnlimited.json"
    );

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        wallet
    );

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    console.log(
        "✅ GenLayerDiceUnlimited deployed to:",
        await contract.getAddress()
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

