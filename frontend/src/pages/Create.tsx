import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/ipfs"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useState } from "react"
import type { ChangeEvent } from "react"
import {
  APTOS_NETWORK_NAME,
  REAL_NFT_MINT_FUNCTION,
  REAL_NFT_MODULE_ADDRESS,
} from "../constants/aptos"

export default function Create() {
  const { account, signAndSubmitTransaction, connected, network, wallet } = useWallet()

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

      const walletNetwork = network?.name?.toLowerCase?.() ?? ""
      if (walletNetwork && walletNetwork !== APTOS_NETWORK_NAME) {
        throw new Error(
          `Wallet is connected to ${network?.name}. Switch to ${APTOS_NETWORK_NAME} and try again.`
        )
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

      const payload: Parameters<typeof signAndSubmitTransaction>[0] = {
        data: {
          function: REAL_NFT_MINT_FUNCTION,
          typeArguments: [],
          functionArguments: [name, metadataURI],
        },
      }

      console.log("MINT DEBUG:", {
        wallet: wallet?.name ?? "unknown",
        account: account.address.toString(),
        walletNetwork: network?.name ?? "unknown",
        expectedNetwork: APTOS_NETWORK_NAME,
        moduleAddress: REAL_NFT_MODULE_ADDRESS,
        function: REAL_NFT_MINT_FUNCTION,
        functionArguments: [name, metadataURI],
      })

      const tx = await signAndSubmitTransaction(payload)

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
    <div className="min-h-screen bg-[#09090d] px-6 pt-28 text-white lg:px-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-24 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-cyan-400/8 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-7xl pb-20">
        <div className="max-w-4xl">
          <p className="text-sm uppercase tracking-[0.34em] text-fuchsia-300">Create</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[0.92] tracking-tight sm:text-7xl">
            Forge New
            <span className="block bg-gradient-to-r from-fuchsia-200 to-violet-400 bg-clip-text text-transparent">
              Artifacts
            </span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-300">
            Transform your concept into a permanent on-chain asset. The mint flow uploads
            preview media and metadata to IPFS, then submits the URI to your Aptos Move module.
          </p>
        </div>

        <div className="mt-14 grid gap-10 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[36px] border border-white/8 bg-[#121116]/90 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
            <div className="space-y-8">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                  Artifact Identity
                </p>
                <input
                  placeholder="Enter NFT Name"
                  className="w-full rounded-full border border-white/6 bg-black/30 px-6 py-5 text-lg text-white outline-none transition placeholder:text-zinc-600 focus:border-fuchsia-300/40"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                  Metadata Anchor (IPFS)
                </p>
                <div className="flex items-center rounded-full border border-white/6 bg-black/30 px-6 py-5">
                  <span className="mr-4 text-zinc-500">ipfs://...</span>
                  <span className="text-sm text-zinc-600">
                    Generated automatically after image + metadata upload
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                  Lore &amp; Context
                </p>
                <div className="rounded-[28px] border border-white/6 bg-black/30 p-6 text-sm leading-7 text-zinc-400">
                  Your current mint implementation uploads the preview file first, then wraps it
                  inside JSON metadata before calling `{REAL_NFT_MODULE_ADDRESS}::RealNFT::mint`.
                </div>
              </div>
            </div>

            <div className="mt-8 inline-flex rounded-full border border-white/8 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-200">
              Estimated gas: <span className="ml-2 text-cyan-300">~0.001 APT</span>
            </div>

            <button
              onClick={handleMint}
              disabled={loading}
              className={`mt-8 w-full rounded-full px-7 py-5 text-lg font-semibold uppercase tracking-[0.24em] transition ${
                loading
                  ? "cursor-not-allowed bg-zinc-700 text-zinc-300"
                  : "bg-gradient-to-r from-fuchsia-200 via-fuchsia-300 to-violet-500 text-black hover:scale-[1.01]"
              }`}
            >
              {loading ? "Minting Artifact..." : "Mint NFT"}
            </button>
          </div>

          <div className="space-y-6">
            <div className="rounded-[36px] border border-dashed border-fuchsia-300/20 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                Visual Manifestation
              </p>

              <label className="flex min-h-[430px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-white/10 bg-black/25 text-center transition hover:border-fuchsia-300/30">
                {preview ? (
                  <img src={preview} className="h-[430px] w-full object-cover" />
                ) : (
                  <div className="max-w-xs px-8">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-fuchsia-300/12 text-3xl text-fuchsia-200">
                      ↑
                    </div>
                    <p className="mt-6 text-3xl font-semibold text-white">Upload Preview Art</p>
                    <p className="mt-3 text-base leading-7 text-zinc-400">
                      Drag and drop or click to browse. Supports the NFT image you will pin to IPFS.
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 text-sm leading-7 text-zinc-300">
              Your artifact will be permanently referenced on-chain once the wallet signs the
              transaction. Double-check the uploaded media before finalizing mint.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
