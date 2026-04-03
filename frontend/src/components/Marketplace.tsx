import { useState } from "react"
import NFTCard from "./NFTCard"
import { marketplaceItems } from "../data/marketplace"

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("all")
  const filteredItems = marketplaceItems.filter((item) => {
    if (activeTab === "collection") return item.isOwner
    if (activeTab === "recent") return item.status === "Recent"
    return true
  })

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          />
        ))}
      </div>
    </div>
  )
}
