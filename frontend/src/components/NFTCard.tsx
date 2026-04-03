import { ipfsToHttp } from "../utils/ipfs"

type NFTCardProps = {
  title: string
  owner: string
  price: string
  image?: string
  isOwner?: boolean
}

export default function NFTCard({
  title,
  owner,
  price,
  image,
  isOwner = false,
}: NFTCardProps) {
  const imageUrl = image ? ipfsToHttp(image) : ""

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

      <div className="h-52 bg-gradient-to-br from-purple-600/40 to-blue-600/30">
        {image ? (
          <img src={imageUrl} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No Image
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-gray-400">Owned by {owner}</p>

        <div className="flex justify-between mt-4">
          <p className="text-purple-400">{price} APT</p>

          <button className="text-xs px-3 py-1 rounded-full bg-purple-500">
            Buy
          </button>
        </div>
      </div>
    </div>
  )
}