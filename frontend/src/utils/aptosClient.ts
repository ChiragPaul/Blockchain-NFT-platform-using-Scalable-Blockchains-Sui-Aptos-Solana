import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk"
import axios from "axios"
import {
  APTOS_NETWORK,
  DEVNET_MARKETPLACE_ACCOUNTS,
  MARKETPLACE_STORE,
  REAL_NFT_STORE,
} from "../constants/aptos"
import { ipfsToHttp } from "./ipfs"

const config = new AptosConfig({
  network: APTOS_NETWORK,
})

export const aptos = new Aptos(config)

type RawStoredNFT = {
  id: string
  name: string
  owner: string
  uri: string
}

type NFTStoreResource = {
  counter: string
  nfts: RawStoredNFT[]
}

type RawListing = {
  nft_id: string
  seller: string
  price: string
}

type MarketplaceStoreResource = {
  listings: RawListing[]
}

export type MarketplaceNFT = {
  id: string
  tokenId: string
  numericTokenId: number
  title: string
  owner: string
  image: string
  metadataUri: string
  price: string
  isOwner: boolean
  status?: string
  isListed: boolean
  seller?: string
}

async function fetchMetadata(uri: string) {
  const response = await axios.get(ipfsToHttp(uri), {
    timeout: 15000,
    validateStatus: (status) => status >= 200 && status < 400,
  })

  return response.data
}

async function mapStoredNft(
  nft: RawStoredNFT,
  connectedAddress?: string
): Promise<MarketplaceNFT> {
  let image = ipfsToHttp(nft.uri)
  let title = nft.name

  try {
    const metadata = await fetchMetadata(nft.uri)

    if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
      if (typeof metadata.name === "string" && metadata.name.trim()) {
        title = metadata.name
      }

      if (typeof metadata.image === "string" && metadata.image.trim()) {
        image = ipfsToHttp(metadata.image)
      }
    }
  } catch {
    // Some older mints stored a direct asset URL instead of JSON metadata.
  }

  return {
    id: `${nft.owner}-${nft.id}`,
    tokenId: `#${nft.id}`,
    numericTokenId: Number(nft.id),
    title,
    owner: nft.owner,
    image,
    metadataUri: nft.uri,
    price: "--",
    isOwner: connectedAddress?.toLowerCase() === nft.owner.toLowerCase(),
    status: "On-chain",
    isListed: false,
  }
}

export async function fetchAccountNFTs(accountAddress: string) {
  try {
    const resource = await aptos.getAccountResource<NFTStoreResource>({
      accountAddress,
      resourceType: REAL_NFT_STORE,
    })

    return resource.nfts
  } catch {
    return []
  }
}

export async function fetchAccountListings(accountAddress: string) {
  try {
    const resource = await aptos.getAccountResource<MarketplaceStoreResource>({
      accountAddress,
      resourceType: MARKETPLACE_STORE,
    })

    return resource.listings
  } catch {
    return []
  }
}

export async function fetchMarketplaceNFTs(connectedAddress?: string) {
  const ownerAddresses = Array.from(
    new Set(
      [...DEVNET_MARKETPLACE_ACCOUNTS, connectedAddress]
        .filter((address): address is string => Boolean(address))
        .map((address) => address.toLowerCase())
    )
  )

  const allStoredNfts = await Promise.all(
    ownerAddresses.map(async (address) => fetchAccountNFTs(address))
  )

  const flattened = allStoredNfts.flat().sort((a, b) => Number(b.id) - Number(a.id))

  const nftResults = await Promise.all(
    flattened.map((nft) => mapStoredNft(nft, connectedAddress))
  )

  const allListings = await Promise.all(
    ownerAddresses.map(async (address) => fetchAccountListings(address))
  )

  const listingMap = new Map(
    allListings
      .flat()
      .map((listing) => [`${listing.seller.toLowerCase()}-${Number(listing.nft_id)}`, listing] as const)
  )

  return nftResults.map((nft) => {
    const listing = listingMap.get(`${nft.owner.toLowerCase()}-${nft.numericTokenId}`)

    if (!listing) {
      return nft
    }

    return {
      ...nft,
      price: listing.price,
      isListed: true,
      seller: listing.seller,
      status: "Listed",
    }
  })
}
