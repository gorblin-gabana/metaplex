const { Keypair, Connection } = require('@solana/web3.js');
const { readFileSync } = require('fs');

// Import Umi framework components
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { generateSigner, keypairIdentity, publicKey } = require('@metaplex-foundation/umi');
const { createV1, mplCore } = require('@metaplex-foundation/mpl-core');

// Your custom MPL Core program address
const CUSTOM_MPL_CORE_PROGRAM = "BvoSmPBF6mBRxBMY9FPguw1zUoUg3xrc5CaWf7y5ACkc";

// Your custom Gorbchain RPC endpoint - using HTTP only to avoid WebSocket issues
const GORBCHAIN_RPC = "https://rpc.gorbchain.xyz";

// Function to load existing keypair
function loadExistingKeypair() {
  try {
    const keypairPath = "your-path-to-keypair";
    const keypairData = readFileSync(keypairPath, 'utf8');
    const secretKey = new Uint8Array(JSON.parse(keypairData));
    const keypair = Keypair.fromSecretKey(secretKey);
    return keypair;
  } catch (error) {
    throw new Error(`Failed to load keypair from ${keypairPath}: ${error.message}`);
  }
}

async function deployNFT() {
  try {
    console.log("🚀 Starting NFT deployment with custom MPL Core program on Gorbchain...");
    
    // 1. Setup Wallet and Connection with custom WebSocket endpoint
    const wallet = loadExistingKeypair();
    const connection = new Connection(
      GORBCHAIN_RPC,
      {
        commitment: 'confirmed',
        wsEndpoint: 'wss://rpc.gorbchain.xyz/ws/'
      }
    );
    

    // Check balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log("💰 Current balance:", balance / 1e9, "SOL");
    
    if (balance < 0.1 * 1e9) {
      console.log("⚠️ Low balance! Make sure you have enough SOL for transaction fees.");
    }

    // 2. Create Umi instance with custom configuration
    const umi = createUmi(connection);
    
    // Convert Solana keypair to Umi keypair
    const umiKeypair = umi.eddsa.createKeypairFromSecretKey(wallet.secretKey);
    
    // Configure Umi with custom program ID - using the plugin without parameters since it's already configured
    umi
      .use(keypairIdentity(umiKeypair))
      .use(mplCore());

    console.log("🔧 Umi configured with MPL Core plugin");
    console.log("🔧 Program ID from plugin:", CUSTOM_MPL_CORE_PROGRAM);

    // Verify the program ID is correctly set
    const programId = umi.programs.getPublicKey('mplCore');
    console.log("🔧 Verified program ID:", programId);

    // 3. Prepare NFT Data
    const nftName = "My first nft  Gorbchain";
    const nftSymbol = "GCMPL";
    const nftDescription = "An NFT created using custom MPL Core program on Gorbchain";
    
    // Use a simple metadata URI for now
    const metadataUri = "https://arweave.net/placeholder-metadata-uri";

    console.log("📋 Using metadata URI:", metadataUri);

    // 4. Generate asset signer
    const asset = generateSigner(umi);
    console.log("🔑 Generated asset address:", asset.publicKey);

    // 5. Create the NFT using MPL Core with timeout
    console.log("🎨 Creating NFT with custom MPL Core program on Gorbchain...");
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Transaction timeout after 60 seconds')), 60000);
    });

    const createPromise = createV1(umi, {
      asset,
      name: nftName,
      uri: metadataUri,
      sellerFeeBasisPoints: 500, // 5% royalty
      plugins: [], // No plugins for now
    }).sendAndConfirm(umi, {
      send: { 
        commitment: "confirmed",
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 3
      }
    });

    const createResult = await Promise.race([createPromise, timeoutPromise]);

    console.log("✅ NFT created successfully!");
    console.log("📝 Transaction signature:", createResult.signature);

    // Generate explorer links
    const explorerLink = `https://explorer.gorbchain.xyz/address/${asset.publicKey}`;
    const txExplorerLink = `https://explorer.gorbchain.xyz/tx/${createResult.signature}`;

    console.log("\n🎉 SUCCESS! Your NFT has been deployed on Gorbchain!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 NFT Address:", asset.publicKey);
    console.log("🔗 View NFT:", explorerLink);
    console.log("🔗 View Transaction:", txExplorerLink);
    console.log("🏷️ Name:", nftName);
    console.log("🏷️ Symbol:", nftSymbol);
    console.log("📄 Metadata URI:", metadataUri);
    console.log("🔧 Custom Program:", CUSTOM_MPL_CORE_PROGRAM);
    console.log("🌐 Network: Gorbchain");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      nftAddress: asset.publicKey,
      signature: createResult.signature,
      explorerLink,
      txExplorerLink,
      metadataUri
    };

  } catch (error) {
    console.error("❌ Error deploying NFT:", error);
    
    // Get more detailed error information
    if (error.getLogs) {
      try {
        const logs = await error.getLogs();
        console.log("📋 Detailed transaction logs:", logs);
      } catch (logError) {
        console.log("📋 Could not retrieve detailed logs");
      }
    }
    
    // Provide helpful error messages
    if (error.message.includes("timeout")) {
      console.log("💡 Transaction timed out. This might be due to network issues or RPC overload.");
      console.log("💡 Try running the script again.");
    } else if (error.message.includes("insufficient funds")) {
      console.log("💡 Make sure you have enough SOL for transaction fees on Gorbchain");
    } else if (error.message.includes("keypair")) {
      console.log("💡 Make sure your keypair file exists");
    } else if (error.message.includes("network")) {
      console.log("💡 Check your connection to Gorbchain RPC");
      console.log("💡 Current RPC:", GORBCHAIN_RPC);
    } else if (error.message.includes("program that does not exist")) {
      console.log("💡 Make sure your MPL Core program is deployed to Gorbchain");
      console.log("💡 Program ID should be:", CUSTOM_MPL_CORE_PROGRAM);
      console.log("💡 Try checking the program with: solana program show", CUSTOM_MPL_CORE_PROGRAM, "--url", GORBCHAIN_RPC);
    }
    
    throw error;
  }
}

// Collection creation function
async function createCollection() {
  try {
    console.log("🏛️ Creating NFT Collection on Gorbchain...");
    
    const wallet = loadExistingKeypair();
    const connection = new Connection(
      GORBCHAIN_RPC,
      {
        commitment: 'confirmed',
        wsEndpoint: 'wss://rpc.gorbchain.xyz/ws/'
      }
    );
    
    const balance = await connection.getBalance(wallet.publicKey);
    console.log("💰 Current balance:", balance / 1e9, "SOL");
    
    if (balance < 0.1 * 1e9) {
      console.log("⚠️ Low balance! Make sure you have enough SOL for transaction fees.");
    }

    const umi = createUmi(connection);
    const umiKeypair = umi.eddsa.createKeypairFromSecretKey(wallet.secretKey);
    
    umi
      .use(keypairIdentity(umiKeypair))
      .use(mplCore());

    const collectionName = "SHIT NFT";
    const collectionDescription = "A collection of NFTs using custom MPL Core program on Gorbchain";
    const metadataUri = "https://arweave.net/placeholder-collection-metadata";
    const collection = generateSigner(umi);

    console.log("🎨 Creating collection...");
    
    const createResult = await createV1(umi, {
      asset: collection,
      name: collectionName,
      uri: metadataUri,
      sellerFeeBasisPoints: 500,
      plugins: [], // Add collection-specific plugins if needed
    }).sendAndConfirm(umi, {
      send: { 
        commitment: "confirmed",
        maxRetries: 3
      }
    });

    const explorerLink = `https://explorer.gorbchain.xyz/address/${collection.publicKey}`;
    
    console.log("✅ Collection created on Gorbchain!");
    console.log("📍 Collection Address:", collection.publicKey);
    console.log("🔗 View Collection:", explorerLink);
    
    return collection.publicKey;
    
  } catch (error) {
    console.error("❌ Error creating collection:", error);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes("--collection")) {
    await createCollection();
  } else {
    await deployNFT();
  }
}

// Run the script
main().catch(console.error);

// Export functions for potential reuse
module.exports = { deployNFT, createCollection }; 