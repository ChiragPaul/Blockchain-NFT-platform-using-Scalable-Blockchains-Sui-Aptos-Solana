module nftloyalty::marketplace {
    use sui::dynamic_object_field as dof;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use nftloyalty::nft::{Self, NFT};
    use nftloyalty::loyalty::Loyalty;

    const EInsufficientPayment: u64 = 1;
    const ENotOwner: u64 = 2;

    public struct Marketplace has key {
        id: UID,
    }

    public struct Listing has key, store {
        id: UID,
        nft_id: ID,
        price: u64,
        seller: address,
    }

    fun init(ctx: &mut TxContext) {
        transfer::share_object(Marketplace {
            id: object::new(ctx),
        });
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    public fun list_nft(
        marketplace: &mut Marketplace,
        nft: NFT,
        price: u64,
        ctx: &mut TxContext
    ) {
        let seller = tx_context::sender(ctx);
        let nft_id = object::id(&nft);
        
        let mut listing = Listing {
            id: object::new(ctx),
            nft_id,
            price,
            seller,
        };
        
        // Attach the NFT directly into the listing
        dof::add(&mut listing.id, b"nft", nft);

        // Attach the listing to the shared marketplace object using the nft_id
        dof::add(&mut marketplace.id, nft_id, listing);
    }

    public fun buy_nft(
        marketplace: &mut Marketplace,
        nft_id: ID,
        mut payment: Coin<SUI>,
        buyer_loyalty: &mut Loyalty,
        ctx: &mut TxContext
    ) {
        let buyer = tx_context::sender(ctx);
        
        // Extract the listing from the marketplace
        let mut listing: Listing = dof::remove(&mut marketplace.id, nft_id);
        
        let price = listing.price;
        assert!(coin::value(&payment) >= price, EInsufficientPayment);
        
        // Process payment
        let paid = coin::split(&mut payment, price, ctx);
        transfer::public_transfer(paid, listing.seller);
        transfer::public_transfer(payment, buyer);

        // Extract the NFT from the listing
        let nft: NFT = dof::remove(&mut listing.id, b"nft");

        // Update NFT ownership and transfer to the buyer
        nft::transfer_nft(nft, buyer, ctx);

        // Award points based on SUI spent (1 point per full SUI)
        let points = price / 1_000_000_000;
        let points_to_add = if (points == 0) { 1 } else { points };
        nftloyalty::loyalty::earn_points(buyer_loyalty, points_to_add);

        // Destroy the listing cleanly
        let Listing { id, nft_id: _, price: _, seller: _ } = listing;
        object::delete(id);
    }

    public fun cancel_listing(
        marketplace: &mut Marketplace,
        nft_id: ID,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let mut listing: Listing = dof::remove(&mut marketplace.id, nft_id);
        
        assert!(listing.seller == sender, ENotOwner);
        
        // Extract NFT from listing
        let nft: NFT = dof::remove(&mut listing.id, b"nft");

        // Return NFT to the seller with owner metadata updated
        nft::transfer_nft(nft, sender, ctx);

        // Clean up listing
        let Listing { id, nft_id: _, price: _, seller: _ } = listing;
        object::delete(id);
    }
}
