import axios from "axios"

const PINATA_JWT = "YOUR_JWT"

export const ipfsToHttp = (url: string) => {
  if (!url) return ""

  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/")
  }

  return url
}

export const uploadFileToIPFS = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "multipart/form-data",
      },
    }
  )

  return `ipfs://${res.data.IpfsHash}`
}

export const uploadJSONToIPFS = async (metadata: any) => {
  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    metadata,
    {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    }
  )

  return `ipfs://${res.data.IpfsHash}`
}