module MyNFT::RealNFT {

    use std::string;
    use std::signer;
    use std::vector;

    /// NFT structure
    struct NFT has store, drop {
        id: u64,
        name: string::String,
        uri: string::String,
        owner: address
    }

    /// Storage per account
    struct NFTStore has key {
        counter: u64,
        nfts: vector<NFT>
    }

    /// ✅ MINT (AUTO-INIT SAFE)
    public entry fun mint(
        account: &signer,
        name: string::String,
        uri: string::String
    ) acquires NFTStore {

        let addr = signer::address_of(account);

        // create store if not exists
        if (!exists<NFTStore>(addr)) {
            move_to(account, NFTStore {
                counter: 0,
                nfts: vector::empty<NFT>()
            });
        };

        let store = borrow_global_mut<NFTStore>(addr);

        let id = store.counter;
        store.counter = store.counter + 1;

        let nft = NFT {
            id,
            name,
            uri,
            owner: addr
        };

        vector::push_back(&mut store.nfts, nft);
    }

    /// ✅ TRANSFER NFT
    public entry fun transfer(
        account: &signer,
        nft_id: u64,
        new_owner: address
    ) acquires NFTStore {

        let addr = signer::address_of(account);

        assert!(exists<NFTStore>(addr), 100);

        let store = borrow_global_mut<NFTStore>(addr);

        let i = 0;
        let len = vector::length(&store.nfts);

        while (i < len) {
            let nft_ref = vector::borrow_mut(&mut store.nfts, i);

            if (nft_ref.id == nft_id) {
                assert!(nft_ref.owner == addr, 101);

                nft_ref.owner = new_owner;
                return;
            };

            i = i + 1;
        };

        abort 102; // NFT not found
    }

    /// ✅ VIEW: number of NFTs
    public fun get_nft_count(owner: address): u64 acquires NFTStore {
        if (!exists<NFTStore>(owner)) {
            return 0;
        };

        let store = borrow_global<NFTStore>(owner);
        vector::length(&store.nfts)
    }

    

    /// ✅ CHECK OWNER
    public fun is_owner(nft: &NFT, addr: address): bool {
        nft.owner == addr
    }
}