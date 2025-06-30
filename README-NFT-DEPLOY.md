# Custom MPL Core NFT Deployer

This script allows you to deploy NFTs using your custom MPL Core program on Solana.

## Custom Program Address
```
BvoSmPBF6mBRxBMY9FPguw1zUoUg3xrc5CaWf7y5ACkc
```

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Solana CLI** installed and configured
3. **Keypair file** at `~/.config/solana/id.json`

### Setup Solana CLI

```bash
# Install Solana CLI
curl -sSf https://release.solana.com/v1.18.0/install | sh

# Generate a new keypair (if you don't have one)
solana-keygen new

# Set to devnet
solana config set --url devnet

# Check your configuration
solana config get

# Get some SOL for testing
solana airdrop 1
```

## Installation

1. **Install dependencies:**
```bash
npm install
```

## Usage

### Deploy a Single NFT

```bash
npm run deploy
```

This will:
- Connect to Solana devnet
- Load your keypair from `~/.config/solana/id.json`
- Airdrop SOL if needed
- Upload metadata to Arweave
- Create an NFT using your custom MPL Core program
- Display the NFT address and explorer links

### Deploy a Collection

```bash
npm run deploy-collection
```

This creates a collection that can hold multiple NFTs.

### Run Directly with Node

```bash
# Deploy NFT
node deploy-nft.js

# Deploy Collection
node deploy-nft.js --collection
```

## Customization

### Adding Your Own Image

1. Place your image file (e.g., `nft-image.png`) in the same directory as the script
2. Uncomment the image upload section in `deploy-nft.js`:

```javascript
const imagePath = path.resolve("./nft-image.png");
try {
  const buffer = await fs.readFile(imagePath);
  const file = createGenericFile(buffer, "nft-image.png", {
    contentType: "image/png",
  });
  
  console.log("📤 Uploading image to Arweave...");
  const [imageUri] = await umi.uploader.upload([file]);
  console.log("🖼️ Image uploaded:", imageUri);
  imageData.image = imageUri;
} catch (error) {
  console.log("⚠️ No local image found, using placeholder");
}
```

### Modify NFT Metadata

Edit the `nftData` object in the script:

```javascript
const nftData = {
  name: "Your NFT Name",
  symbol: "YOUR",
  description: "Your NFT description",
  sellerFeeBasisPoints: 500, // 5% royalty
};
```

### Add Attributes

Modify the `imageData.attributes` array:

```javascript
attributes: [
  {
    trait_type: "Rarity",
    value: "Legendary"
  },
  {
    trait_type: "Color",
    value: "Blue"
  }
]
```

## Network Configuration

### Switch to Mainnet

To deploy on mainnet, change the connection:

```javascript
const connection = new Connection(clusterApiUrl("mainnet-beta"));
```

**⚠️ Warning:** Make sure you have enough SOL and test thoroughly on devnet first!

### Use Custom RPC

```javascript
const connection = new Connection("https://your-custom-rpc-url.com");
```

## Output

After successful deployment, you'll see:

```
🎉 SUCCESS! Your NFT has been deployed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 NFT Address: [ADDRESS]
🔗 View NFT: https://explorer.solana.com/address/[ADDRESS]?cluster=devnet
🔗 View Transaction: https://explorer.solana.com/tx/[SIGNATURE]?cluster=devnet
🏷️ Name: My Custom MPL Core NFT
🏷️ Symbol: CMPL
📄 Metadata URI: https://arweave.net/[HASH]
🔧 Custom Program: BvoSmPBF6mBRxBMY9FPguw1zUoUg3xrc5CaWf7y5ACkc
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Troubleshooting

### Common Errors

1. **"insufficient funds"**
   ```bash
   solana airdrop 1 --url devnet
   ```

2. **"keypair not found"**
   ```bash
   solana-keygen new
   ```

3. **"network error"**
   - Check your internet connection
   - Try a different RPC endpoint

### Verify Your Setup

```bash
# Check Solana CLI version
solana --version

# Check your keypair
solana address

# Check your balance
solana balance

# Check your configuration
solana config get
```

## Features

- ✅ Uses your custom MPL Core program
- ✅ Automatic SOL airdrop for testing
- ✅ Image upload to Arweave
- ✅ Metadata upload to Arweave
- ✅ Comprehensive error handling
- ✅ Explorer links for easy viewing
- ✅ Collection support
- ✅ Configurable royalties
- ✅ Custom attributes support

## Dependencies

- `@metaplex-foundation/mpl-core`: MPL Core program interaction
- `@metaplex-foundation/umi`: Metaplex framework
- `@metaplex-foundation/umi-bundle-defaults`: Umi defaults
- `@metaplex-foundation/umi-uploader-irys`: Arweave uploader
- `@solana/web3.js`: Solana JavaScript SDK
- `@solana-developers/helpers`: Solana development utilities

## License

MIT License

## Support

If you encounter any issues:
1. Check the troubleshooting section
2. Verify your Solana CLI setup
3. Ensure you have sufficient SOL balance
4. Check your network connection

Happy minting! 🚀 