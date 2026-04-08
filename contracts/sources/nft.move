module MyNFT::NFT {

    use std::string;
    use std::signer;

    struct NFT has key, store {
        id: u64,
        name: string::String,
        uri: string::String,
        owner: address
    }

    public entry fun mint(
        creator: &signer,
        name: string::String,
        uri: string::String
    ) {
        let owner = signer::address_of(creator);

        let nft = NFT {
            id: 1,
            name,
            uri,
            owner
        };

        move_to(creator, nft);
    }
}