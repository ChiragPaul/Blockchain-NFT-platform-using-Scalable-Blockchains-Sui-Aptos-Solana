import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaCounter } from "../target/types/solana_counter";
import { Keypair, SystemProgram } from "@solana/web3.js";

describe("solana-counter", () => {
  // Connect to local/devnet via environment provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Load the deployed program using its IDL
  const program = anchor.workspace.SolanaCounter as Program<SolanaCounter>;

  // Generate a fresh keypair for the counter account
  const counterKeypair = Keypair.generate();

  // Test 1: Initialize the counter
  it("Initializes the counter", async () => {
    await program.methods
      .initialize()                           // Call initialize instruction
      .accounts({
        counter: counterKeypair.publicKey,    // New counter account address
        authority: provider.wallet.publicKey, // Our wallet as authority
        systemProgram: SystemProgram.programId, // Required system program
      })
      .signers([counterKeypair])              // Counter keypair must sign (new account)
      .rpc();                                 // Send transaction to blockchain

    // Fetch and display the counter value
    const account = await program.account.counter.fetch(counterKeypair.publicKey);
    console.log("Counter initialized! Value:", account.count.toString());
    // Expected output: Counter initialized! Value: 0
  });

  // Test 2: Increment the counter
  it("Increments the counter", async () => {
    await program.methods
      .increment()                            // Call increment instruction
      .accounts({
        counter: counterKeypair.publicKey,    // Same counter account
        authority: provider.wallet.publicKey, // Same authority wallet
      })
      .rpc();                                 // Send transaction to blockchain

    // Fetch and display updated counter value
    const account = await program.account.counter.fetch(counterKeypair.publicKey);
    console.log("Counter incremented! Value:", account.count.toString());
    // Expected output: Counter incremented! Value: 1
  });
});
