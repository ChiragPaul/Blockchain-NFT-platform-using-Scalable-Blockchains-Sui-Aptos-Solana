import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk"
import { APTOS_NETWORK } from "../constants/aptos"

const config = new AptosConfig({
  network: APTOS_NETWORK,
})

export const aptos = new Aptos(config)
