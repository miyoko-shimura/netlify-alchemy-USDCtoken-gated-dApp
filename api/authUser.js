import { verifyMessage } from "ethers/lib/utils";
const { Alchemy, Network, AssetTransfersCategory } = require("alchemy-sdk");

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_GOERLI, // Replace with your desired network.
};

const alchemy = new Alchemy(settings);

export default async function handler(req, res) {
  const requestMethod = req.method;
  const body = JSON.parse(req.body);
  const { signerAddress, signerMessage, signerData } = body;
  const recoveredAddress = verifyMessage(signerMessage, signerData);
  let totalTokensSent = 0;
  if (signerAddress == recoveredAddress) {
    console.log("Successful signature verification!");
    totalTokensSent = await getAmountTokensSent(recoveredAddress);
  }

  switch (requestMethod) {
    case "POST":
      // if the user has paid the merchant 1 $USDC on Goerli, reveal the secret!
      if (totalTokensSent >= 1) {
        res.status(200).json({
          message: "The secret party is at 555 Krabby Patty St. at 1pm PST! 🤫",
        });
      } else {
        // if the user hasn't paid yet, prompt them to pay!
        res.status(200).json({
          message:
            "You haven't paid 1 $USDC to 0x2c8645BFE28BEEb6E19843eE9573b7539DD5B530! ❌",
        });
      }
  }
}

async function getAmountTokensSent(userAddress) {
  // uses getAssetTransfer endpoint to get back ALL ERC-20 asset transfers from/to
  const getTransfers = await alchemy.core.getAssetTransfers({
    fromBlock: "0x0",
    toBlock: "latest",
    fromAddress: userAddress,
    // merchant address! replace with one you own!
    toAddress: "0x2c8645BFE28BEEb6E19843eE9573b7539DD5B530",
    excludeZeroValue: true,
    category: [AssetTransfersCategory.ERC20],
  });
  // aggregates all values to create a total amount sent... EVER!
  let totalTransferValue = 0;
  getTransfers["transfers"].forEach((tx) => {
    totalTransferValue += tx.value;
  });
  return totalTransferValue;
}