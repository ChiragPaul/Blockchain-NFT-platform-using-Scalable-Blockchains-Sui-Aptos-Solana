module MyNFT::Marketplace {

    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::coin;
    use std::signer;
    use std::vector;
    use MyNFT::RealNFT;

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
        let seller_addr = signer::address_of(seller);
        assert!(RealNFT::has_nft(seller_addr, nft_id), 100);

        if (!exists<MarketplaceStore>(seller_addr)) {
            move_to(seller, MarketplaceStore {
                listings: vector::empty<Listing>()
            });
        };

        let store = borrow_global_mut<MarketplaceStore>(seller_addr);
        let i = 0;
        let len = vector::length(&store.listings);

        while (i < len) {
            let listing = vector::borrow(&store.listings, i);
            assert!(listing.nft_id != nft_id, 101);
            i = i + 1;
        };

        let listing = Listing {
            nft_id,
            seller: seller_addr,
            price
        };

        vector::push_back(&mut store.listings, listing);
    }

    public entry fun buy_nft(
        buyer: &signer,
        seller_addr: address,
        nft_id: u64
    ) acquires MarketplaceStore {
        assert!(exists<MarketplaceStore>(seller_addr), 102);

        let store = borrow_global_mut<MarketplaceStore>(seller_addr);

        let i = 0;
        let len = vector::length(&store.listings);

        while (i < len) {
            let listing = vector::borrow(&store.listings, i);

            if (listing.nft_id == nft_id) {
                let purchased_listing = vector::swap_remove(&mut store.listings, i);
                coin::transfer<AptosCoin>(buyer, seller_addr, purchased_listing.price);
                RealNFT::marketplace_transfer(buyer, seller_addr, purchased_listing.nft_id);
                return;
            };

            i = i + 1;
        };

        abort 103;
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
