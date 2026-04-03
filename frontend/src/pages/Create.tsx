import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/ipfs"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useState } from "react"
import type { ChangeEvent } from "react"
import { REAL_NFT_MODULE_ADDRESS } from "../constants/aptos"

export default function Create() {
  const { account, signAndSubmitTransaction, connected } = useWallet()

  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  // 📁 FILE HANDLER
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
  }

  // 🚀 FINAL MINT
  const handleMint = async () => {
    try {
      // 🔐 WALLET CHECK
      if (!connected || !account?.address) {
        alert("Connect wallet first ❌")
        return
      }

      // 📦 INPUT CHECK
      if (!name || !file) {
        alert("Enter name + upload image ❌")
        return
      }

      setLoading(true)

      console.log("Wallet:", account.address)

      // ✅ STEP 1: Upload IMAGE
      const imageURI = await uploadFileToIPFS(file)
      if (!imageURI) throw new Error("Image upload failed")

      console.log("IMAGE URI:", imageURI)
      console.log(
        "TEST IMAGE:",
        imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
      )

      // ✅ STEP 2: Create METADATA
      const metadata = {
        name,
        description: "NFT created on Aptos",
        image: imageURI, // ✅ MUST BE IMAGE CID
      }

      console.log("METADATA:", metadata)

      // ✅ STEP 3: Upload METADATA
      const metadataURI = await uploadJSONToIPFS(metadata)
      if (!metadataURI) throw new Error("Metadata upload failed")

      console.log("METADATA URI:", metadataURI)

      // 🔥 STEP 4: MINT (LATEST SDK FORMAT)
      const tx = await signAndSubmitTransaction({
        data: {
          function: `${REAL_NFT_MODULE_ADDRESS}::RealNFT::mint`,
          typeArguments: [],
          functionArguments: [name, metadataURI],
        },
      })

      console.log("TX SUCCESS:", tx)

      alert("NFT Minted Successfully 🚀")

      // 🔄 RESET STATE
      setName("")
      setFile(null)
      setPreview(null)

    } catch (error: any) {
      console.error("FULL ERROR:", error)

      if (error?.message?.includes("User rejected")) {
        alert("Transaction cancelled ❌")
      } else {
        alert(error?.message || "Mint failed ❌")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 flex flex-col items-center">

      <h1 className="text-5xl font-bold mb-4 text-center">
        Forge New <span className="text-purple-400">Artifacts</span>
      </h1>

      <p className="text-gray-400 mb-10 text-center max-w-xl">
        Deploy your digital assets on the Aptos network.
      </p>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-[400px] shadow-lg">

        {/* IMAGE UPLOAD */}
        <label className="border border-dashed border-gray-600 rounded-xl h-40 flex items-center justify-center cursor-pointer overflow-hidden mb-6">
          {preview ? (
            <img src={preview} className="h-full w-full object-cover" />
          ) : (
            <span className="text-gray-400 text-sm">Upload Preview Art</span>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* NAME */}
        <input
          placeholder="NFT Name"
          className="w-full mb-6 p-3 rounded bg-black border border-gray-700 focus:outline-none focus:border-purple-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* BUTTON */}
        <button
          onClick={handleMint}
          disabled={loading}
          className={`w-full py-3 rounded-full font-semibold transition ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-400 to-purple-600 hover:opacity-90"
          }`}
        >
          {loading ? "Minting..." : "Mint NFT ✨"}
        </button>
      </div>
    </div>
  )
}
