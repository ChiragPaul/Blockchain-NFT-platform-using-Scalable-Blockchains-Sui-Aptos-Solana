# Solana Counter Program

A simple counter smart contract built with the Anchor framework on Solana.

## Program ID
```
4szpqSfn4XeXMDtabp7hrcXiWQ5PMgePxPTjKgEVDfcm
```

## Project Structure
```
solana-counter/
├── Anchor.toml                          # Project configuration
├── Cargo.toml                           # Workspace manifest
├── tsconfig.json                        # TypeScript config
├── programs/
│   └── solana-counter/
│       ├── Cargo.toml                   # Program dependencies
│       └── src/
│           └── lib.rs                   # Smart contract (MAIN CODE)
└── tests/
    └── solana-counter.ts                # Integration tests
```

## Instructions

### `initialize`
- Creates a new Counter account on-chain
- Sets the initial count to 0
- Stores the authority (owner) wallet address

### `increment`
- Increments the counter value by 1
- Requires the authority wallet to sign

## Account Structure
```
Counter {
    count: u64,        // 8 bytes - the counter value
    authority: Pubkey  // 32 bytes - owner wallet address
}
Total space: 8 (discriminator) + 8 + 32 = 48 bytes
```

## Setup & Installation

### Prerequisites
- Rust 1.94.1+
- Solana CLI 3.1.12+
- Anchor CLI 0.32.1+
- Node.js v20+
- Yarn

### Build
```bash
anchor build
```

### Deploy to Devnet
```bash
solana config set --url devnet
anchor deploy
```

### Deploy to Localnet
```bash
solana-test-validator --reset   # Terminal 1
solana config set --url localhost
anchor deploy
```

### Run Tests
```bash
anchor test --skip-local-validator
```

## Expected Test Output
```
solana-counter
  Counter initialized! Value: 0
  ✔ Initializes the counter (562ms)
  Counter incremented! Value: 1
  ✔ Increments the counter (412ms)

2 passing (984ms)
```

## Networks Deployed
| Network  | RPC URL                          | Status    |
|----------|----------------------------------|-----------|
| Devnet   | https://api.devnet.solana.com    | Deployed  |
| Localnet | http://127.0.0.1:8899            | Deployed  |

## Explorer
https://explorer.solana.com/address/4szpqSfn4XeXMDtabp7hrcXiWQ5PMgePxPTjKgEVDfcm?cluster=devnet

## Author
Raghav — Solana Developer Lab
