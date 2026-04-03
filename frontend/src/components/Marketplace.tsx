import { useEffect, useState } from "react"
import NFTCard from "./NFTCard"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import type { InputTransactionData } from "@aptos-labs/wallet-adapter-core"
import {
  type MarketplaceNFT,
  aptos,
  fetchMarketplaceNFTs,
} from "../utils/aptosClient"
import {
  APTOS_NETWORK_NAME,
  MARKETPLACE_BUY_FUNCTION,
  MARKETPLACE_CANCEL_FUNCTION,
  MARKETPLACE_INIT_FUNCTION,
  MARKETPLACE_STORE,
  MARKETPLACE_LIST_FUNCTION,
} from "../constants/aptos"

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("all")
  const {
    account,
    connected,
    network,
    signAndSubmitTransaction,
    wallet,
  } = useWallet()
  const [nfts, setNfts] = useState<MarketplaceNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [activeNftId, setActiveNftId] = useState<string | null>(null)

  const loadNfts = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchMarketplaceNFTs(account?.address.toString())
      setNfts(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch NFTs from Devnet"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await fetchMarketplaceNFTs(account?.address.toString())

        if (!ignore) {
          setNfts(data)
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch NFTs from Devnet"
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      ignore = true
    }
  }, [account?.address])

  const filteredItems = nfts.filter((item) => {
    if (activeTab === "collection") return item.isOwner
    if (activeTab === "recent") return item.isListed
    return true
  })

  const ensureDevnet = () => {
    const walletNetwork = network?.name?.toLowerCase?.() ?? ""
    if (walletNetwork && walletNetwork !== APTOS_NETWORK_NAME) {
      throw new Error(
        `Wallet is connected to ${network?.name}. Switch to ${APTOS_NETWORK_NAME} and try again.`
      )
    }
  }

  const ensureMarketplaceStore = async (address: string) => {
    try {
      await aptos.getAccountResource({
        accountAddress: address,
        resourceType: MARKETPLACE_STORE,
      })
    } catch {
      const initPayload: InputTransactionData = {
        data: {
          function: MARKETPLACE_INIT_FUNCTION,
          typeArguments: [],
          functionArguments: [],
        },
      }

      const initTx = await signAndSubmitTransaction(initPayload)
      await aptos.waitForTransaction({ transactionHash: initTx.hash })
    }
  }

  const handleListOrCancel = async (nft: MarketplaceNFT) => {
    try {
      if (!connected || !account?.address) {
        throw new Error("Connect wallet first.")
      }

      ensureDevnet()
      setActionError(null)
      setActiveNftId(nft.id)

      const walletAddress = account.address.toString().toLowerCase()
      if (walletAddress !== nft.owner.toLowerCase()) {
        throw new Error("Only the NFT owner can manage listings.")
      }

      if (nft.isListed) {
        const shouldCancel = window.confirm(
          `Cancel listing for ${nft.title} ${nft.tokenId}?`
        )

        if (!shouldCancel) {
          return
        }

        const cancelPayload: InputTransactionData = {
          data: {
            function: MARKETPLACE_CANCEL_FUNCTION,
            typeArguments: [],
            functionArguments: [nft.numericTokenId],
          },
        }

        const tx = await signAndSubmitTransaction(cancelPayload)
        await aptos.waitForTransaction({ transactionHash: tx.hash })
        await loadNfts()
        return
      }

      const priceInput = window.prompt(
        `Set listing price in APT for ${nft.title} ${nft.tokenId}`,
        "1"
      )

      if (!priceInput) {
        return
      }

      const normalized = priceInput.trim()
      if (!/^\d+$/.test(normalized)) {
        throw new Error("Listing price must be a whole number in APT for the current contract.")
      }

      await ensureMarketplaceStore(account.address.toString())

      const listPayload: InputTransactionData = {
        data: {
          function: MARKETPLACE_LIST_FUNCTION,
          typeArguments: [],
          functionArguments: [nft.numericTokenId, Number(normalized)],
        },
      }

      console.log("LIST DEBUG:", {
        wallet: wallet?.name ?? "unknown",
        owner: account.address.toString(),
        network: network?.name ?? "unknown",
        nftId: nft.numericTokenId,
        price: normalized,
        function: MARKETPLACE_LIST_FUNCTION,
      })

      const tx = await signAndSubmitTransaction(listPayload)
      await aptos.waitForTransaction({ transactionHash: tx.hash })
      await loadNfts()
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Marketplace action failed"
      )
    } finally {
      setActiveNftId(null)
    }
  }

  const handleBuy = async (nft: MarketplaceNFT) => {
    try {
      if (!connected || !account?.address) {
        throw new Error("Connect wallet first.")
      }

      ensureDevnet()
      setActionError(null)
      setActiveNftId(nft.id)

      if (!nft.isListed || !nft.seller) {
        throw new Error("This NFT is not listed for sale.")
      }

      if (account.address.toString().toLowerCase() === nft.owner.toLowerCase()) {
        throw new Error("You already own this NFT.")
      }

      const shouldBuy = window.confirm(
        `Buy ${nft.title} ${nft.tokenId} for ${nft.price} APT?`
      )

      if (!shouldBuy) {
        return
      }

      const buyPayload: InputTransactionData = {
        data: {
          function: MARKETPLACE_BUY_FUNCTION,
          typeArguments: [],
          functionArguments: [nft.seller, nft.numericTokenId],
        },
      }

      console.log("BUY DEBUG:", {
        wallet: wallet?.name ?? "unknown",
        buyer: account.address.toString(),
        network: network?.name ?? "unknown",
        nftId: nft.numericTokenId,
        seller: nft.seller,
        price: nft.price,
        function: MARKETPLACE_BUY_FUNCTION,
      })

      const tx = await signAndSubmitTransaction(buyPayload)
      await aptos.waitForTransaction({ transactionHash: tx.hash })
      await loadNfts()
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Buy transaction failed"
      )
    } finally {
      setActiveNftId(null)
    }
  }

  return (
    <div className="mt-10">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.34em] text-cyan-300">
            Curated Marketplace
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            The Curator&apos;s Selection
          </h2>
        </div>

        <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-white/8 bg-white/[0.04] px-4 py-3">
          <span className="text-zinc-500">Search</span>
          <input
            placeholder="Filter by collection, title, or creator..."
            className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
          />
          <button className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-300">
            Sort
          </button>
        </div>
      </div>

      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-3">
          {["all", "collection", "recent"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm capitalize transition ${
                activeTab === tab
                  ? "bg-gradient-to-r from-fuchsia-300 to-violet-500 text-black"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {tab === "all"
                ? "All Items"
                : tab === "collection"
                ? "My Collection"
                : "Recently Listed"}
            </button>
          ))}
        </div>
      </div>

      {actionError ? (
        <div className="mb-6 rounded-[24px] border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-amber-100">
          {actionError}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[380px] animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-400/5 p-6 text-sm text-rose-200">
          {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-8 text-zinc-300">
          No on-chain NFTs found yet for the tracked Devnet accounts.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((nft) => (
            <NFTCard
              key={nft.id}
              tokenId={nft.tokenId}
              title={nft.title}
              owner={nft.owner}
              price={nft.price}
              image={nft.image}
              status={nft.status}
              isOwner={nft.isOwner}
              isListed={nft.isListed}
              actionLabel={
                activeNftId === nft.id
                  ? "Processing"
                  : nft.isOwner
                  ? nft.isListed
                    ? "Cancel Listing"
                    : "List for Sale"
                  : nft.isListed
                    ? "Buy Now"
                    : "View Only"
              }
              actionDisabled={
                activeNftId === nft.id || (!nft.isOwner && !nft.isListed)
              }
              onAction={
                nft.isOwner
                  ? () => void handleListOrCancel(nft)
                  : nft.isListed
                    ? () => void handleBuy(nft)
                    : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
