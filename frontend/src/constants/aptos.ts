import { Network } from "@aptos-labs/ts-sdk"

export const APTOS_NETWORK = Network.DEVNET
export const APTOS_NETWORK_NAME = "devnet"

export const REAL_NFT_MODULE_ADDRESS =
  "0xb61ff39ec3c625ff169d3de1859cb74a05238ff18bb6ee4a19cd10375a9dfda8"

export const REAL_NFT_MODULE_NAME = "RealNFT"
export const REAL_NFT_MINT_FUNCTION = `${REAL_NFT_MODULE_ADDRESS}::${REAL_NFT_MODULE_NAME}::mint`
