#[test_only]
module nftloyalty::nftloyalty_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use nftloyalty::nft::{Self, NFT};
    use nftloyalty::loyalty::{Self, Loyalty};
    use nftloyalty::marketplace::{Self, Marketplace, Listing};

    const SELLER: address = @0xA;
    const BUYER: address = @0xB;

    #[test]
    fun test_mint_list_buy_and_loyalty() {
        let mut scenario = test_scenario::begin(SELLER);
        
        // 1. Setup Marketplace
        test_scenario::next_tx(&mut scenario, SELLER);
        marketplace::init_for_testing(test_scenario::ctx(&mut scenario));

        // 2. Buyer creates loyalty profile
        test_scenario::next_tx(&mut scenario, BUYER);
        loyalty::create_profile(test_scenario::ctx(&mut scenario));
        
        // 3. Seller mints NFT
        test_scenario::next_tx(&mut scenario, SELLER);
        nft::mint_nft(b"Test", b"Desc", b"ipfs://url", test_scenario::ctx(&mut scenario));
        
        // 4. Seller lists NFT
        test_scenario::next_tx(&mut scenario, SELLER);
        let nft = test_scenario::take_from_sender<NFT>(&scenario);
        let mut mkt = test_scenario::take_shared<Marketplace>(&scenario);
        
        let nft_id = sui::object::id(&nft);
        marketplace::list_nft(&mut mkt, nft, 5_000_000_000, test_scenario::ctx(&mut scenario));
        
        // 5. Buyer buys NFT
        test_scenario::next_tx(&mut scenario, BUYER);
        let mut buyer_loyalty = test_scenario::take_from_sender<Loyalty>(&scenario);
        let payment = coin::mint_for_testing<SUI>(5_000_000_000, test_scenario::ctx(&mut scenario));
        
        marketplace::buy_nft(&mut mkt, nft_id, payment, &mut buyer_loyalty, test_scenario::ctx(&mut scenario));
        
        // Verify loyalty points
        assert!(loyalty::points(&buyer_loyalty) == 5, 0); // 5 SUI = 5 points
        
        // Clean up scenario tracking
        test_scenario::return_to_sender(&scenario, buyer_loyalty);
        test_scenario::return_shared(mkt);
        
        test_scenario::end(scenario);
    }
}
