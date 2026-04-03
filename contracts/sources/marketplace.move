module MyNFT::Marketplace {

    use std::signer;
    use std::vector;

    struct Listing has key, store, drop {
        nft_id: u64,
        seller: address,
        price: u64
    }

    struct MarketplaceStore has key {
        listings: vector<Listing>
    }

    public entry fun init(account: &signer) {
        move_to(account, MarketplaceStore {
            listings: vector::empty<Listing>()
        });
    }

    public entry fun list_nft(
        seller: &signer,
        nft_id: u64,
        price: u64
    ) acquires MarketplaceStore {

        let store = borrow_global_mut<MarketplaceStore>(signer::address_of(seller));

        let listing = Listing {
            nft_id,
            seller: signer::address_of(seller),
            price
        };

        vector::push_back(&mut store.listings, listing);
    }

    public entry fun buy_nft(
        _buyer: &signer,
        seller_addr: address,
        nft_id: u64
    ) acquires MarketplaceStore {

        let store = borrow_global_mut<MarketplaceStore>(seller_addr);

        let i = 0;
        let len = vector::length(&store.listings);

        while (i < len) {
            let listing = vector::borrow(&store.listings, i);

            if (listing.nft_id == nft_id) {
                vector::swap_remove(&mut store.listings, i);
                return;
            };

            i = i + 1;
        };

        abort 1;
    }

    public entry fun cancel_listing(
        seller: &signer,
        nft_id: u64
    ) acquires MarketplaceStore {

        let store = borrow_global_mut<MarketplaceStore>(signer::address_of(seller));

        let i = 0;
        let len = vector::length(&store.listings);

        while (i < len) {
            let listing = vector::borrow(&store.listings, i);

            if (listing.nft_id == nft_id) {
                vector::swap_remove(&mut store.listings, i);
                return;
            };

            i = i + 1;
        };

        abort 1;
    }
}