const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "idls");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..", "programs");

generateIdl({
  generator: "shank",
  programName: "mpl_core",
  programId: "BvoSmPBF6mBRxBMY9FPguw1zUoUg3xrc5CaWf7y5ACkc",
  idlDir,
  idlName: "mpl_core",
  binaryInstallDir,
  programDir: path.join(programDir, "mpl-core"),
});
