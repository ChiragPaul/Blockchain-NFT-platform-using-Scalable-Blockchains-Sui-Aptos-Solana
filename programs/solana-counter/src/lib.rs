use anchor_lang::prelude::*;

// Unique on-chain address of this deployed program
declare_id!("4szpqSfn4XeXMDtabp7hrcXiWQ5PMgePxPTjKgEVDfcm");

// Marks this module as containing Solana instruction handlers
#[program]
pub mod solana_counter {
    use super::*;

    // Instruction 1: Creates and initializes the counter to zero
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;                                    // Set initial value
        counter.authority = ctx.accounts.authority.key();    // Store owner wallet
        msg!("Counter initialized! Count: {}", counter.count);
        Ok(())
    }

    // Instruction 2: Increments the counter by 1
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count += 1;                                   // Add one
        msg!("Counter incremented! Count: {}", counter.count);
        Ok(())
    }
}

// Account validation struct for initialize instruction
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,              // Create this account on-chain
        payer = authority, // Wallet paying for account creation
        space = 8 + 8 + 32 // 8 discriminator + 8 u64 + 32 Pubkey
    )]
    pub counter: Account<'info, Counter>,       // The counter data account
    #[account(mut)]
    pub authority: Signer<'info>,               // Wallet signing transaction
    pub system_program: Program<'info, System>, // Required to create accounts
}

// Account validation struct for increment instruction
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>, // Mutable — will be modified
    pub authority: Signer<'info>,         // Must sign to authorize
}

// On-chain data structure stored in the Counter account
#[account]
pub struct Counter {
    pub count: u64,        // 8 bytes — stores the counter value
    pub authority: Pubkey, // 32 bytes — stores the owner's wallet address
}
