import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { REAL_NFT_MODULE_ADDRESS } from "../constants/aptos"

export default function Mint() {
  const { account, signAndSubmitTransaction } = useWallet()

  const handleMint = async () => {
    if (!account) {
      alert("Connect wallet first")
      return
    }

    try {
      const payload = {
        type: "entry_function_payload",
        function: `${REAL_NFT_MODULE_ADDRESS}::RealNFT::mint`,
        arguments: [
          "Frontend NFT",
          "https://example.com/frontend.png"
        ],
        type_arguments: []
      }

      const res = await signAndSubmitTransaction(payload as any)

      console.log("TX:", res)
      alert("Mint successful 🚀")
    } catch (e) {
      console.error(e)
      alert("Mint failed")
    }
  }

  return (
    <div className="p-10">
      <button
        onClick={handleMint}
        className="bg-purple-600 px-6 py-3 rounded"
      >
        Mint NFT
      </button>
    </div>
  )
}
