import { useState } from "react"
import NFTCard from "./NFTCard"

type NFT = {
  id: number
  title: string
  owner: string
  price: string
  image: string
}

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("all")

  const nfts: NFT[] = [
    {
      id: 1,
      title: "Resident Evil Requiem",
      owner: "0xb61f...dfa8",
      price: "12.5",
      image: "ipfs://QmdhAieYRxnPqf8fXQcbkbaeUZNBJjG8Hptu1nFbh4uSDN",
    },
    {
      id: 2,
      title: "Cyber Bloom",
      owner: "0x82a...4f21",
      price: "8.2",
      image: "ipfs://QmdhAieYRxnPqf8fXQcbkbaeUZNBJjG8Hptu1nFbh4uSDN",
    },
    {
      id: 3,
      title: "Neon Splicer",
      owner: "0x92b...1ac3",
      price: "15.0",
      image: "ipfs://QmdhAieYRxnPqf8fXQcbkbaeUZNBJjG8Hptu1nFbh4uSDN",
    },
    {
      id: 4,
      title: "Luminous Path",
      owner: "0x3e1...b902",
      price: "5.2",
      image: "ipfs://QmdhAieYRxnPqf8fXQcbkbaeUZNBJjG8Hptu1nFbh4uSDN",
    },
  ]

  // 🔍 DEBUG
  console.log("NFT DATA:", nfts)

  return (
    <div className="mt-10">

      {/* FILTER BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">

        <div className="flex gap-3">
          {["all", "collection", "recent"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm capitalize ${
                activeTab === tab
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-400"
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

        <input
          placeholder="Search NFTs..."
          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm outline-none w-[250px]"
        />
      </div>

      {/* NFT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {nfts.map((nft) => (
          <NFTCard
            key={nft.id}
            title={nft.title}
            owner={nft.owner}
            price={nft.price}
            image={nft.image}
            isOwner={false}
          />
        ))}
      </div>
    </div>
  )
}