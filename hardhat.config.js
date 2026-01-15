/** @type import('hardhat/config').HardhatUserConfig */
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: "0.8.20",
    networks: {
        genlayer: {
            type: "http",
            url: "https://rpc.genlayer.xyz", // or studio.genlayer.com/api
            accounts: [process.env.PRIVATE_KEY]
        }
    }
};
