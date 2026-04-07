module nftloyalty::nft {
    /// The NFT Object representing a unique digital asset
    public struct NFT has key, store {
        id: UID,
        name: vector<u8>,
        description: vector<u8>,
        url: vector<u8>,
        owner: address,
    }

    /// Mint a new NFT
    public fun mint_nft(
        name: vector<u8>,
        description: vector<u8>,
        url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let nft = NFT {
            id: object::new(ctx),
            name,
            description,
            url,
            owner: sender,
        };
        // Transfer the newly minted NFT to the sender
        transfer::public_transfer(nft, sender);
    }

    /// Transfer an NFT to a new owner
    public fun transfer_nft(
        mut nft: NFT,
        recipient: address,
        _ctx: &mut TxContext
    ) {
        // Update the owner address metadata
        nft.owner = recipient;
        transfer::public_transfer(nft, recipient);
    }

    // Accessors for external modules if needed
    public fun owner(nft: &NFT): address {
        nft.owner
    }
}
