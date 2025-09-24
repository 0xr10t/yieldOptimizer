module vault_addr::lending_protocol {
    use aptos_framework::fungible_asset::{Self, FungibleAsset, Metadata, MintRef, BurnRef};
    use aptos_framework::object::{Object};
    use vault_addr::mock_coins;

    struct ReceiptToken has key, store, drop {}
    struct RewardToken has key, store, drop {}

    struct Pool has key {
        total_supplied: u128,
        receipt_token_mint_ref: MintRef,
        receipt_token_burn_ref: BurnRef,
        reward_token_mint_ref: MintRef,
    }
    
    public fun deposit(pool_addr: address, asset_to_supply: FungibleAsset): FungibleAsset acquires Pool {
        let pool = borrow_global_mut<Pool>(pool_addr);
        let amount = fungible_asset::amount(&asset_to_supply);
        
        // FIXED: Call the safe, high-level function in the other module.
        mock_coins::mock_burn(asset_to_supply);
        
        pool.total_supplied = pool.total_supplied + (amount as u128);
        fungible_asset::mint(&pool.receipt_token_mint_ref, amount)
    }

    public fun withdraw(pool_addr: address, receipt_asset: FungibleAsset): FungibleAsset acquires Pool {
        let pool = borrow_global_mut<Pool>(pool_addr);
        let amount = fungible_asset::amount(&receipt_asset);
        fungible_asset::burn(&pool.receipt_token_burn_ref, receipt_asset);
        pool.total_supplied = pool.total_supplied - (amount as u128);
        
        // FIXED: Call the safe, high-level function in the other module.
        mock_coins::mock_mint(amount)
    }

    public fun claim_rewards(pool_addr: address): FungibleAsset acquires Pool {
        let pool = borrow_global<Pool>(pool_addr);
        fungible_asset::mint(&pool.reward_token_mint_ref, 10 * 1_000_000)
    }

    public fun get_receipt_token_metadata(pool_addr: address): Object<Metadata> acquires Pool {
        let pool = borrow_global<Pool>(pool_addr);
        fungible_asset::mint_ref_metadata(&pool.receipt_token_mint_ref)
    }

    #[test_only]
    public fun initialize_mock_protocol(deployer: &signer) {
        use std::string;
        use std::option;
        use aptos_framework::primary_fungible_store;
        use aptos_framework::object;

        let receipt_constructor = &object::create_named_object(deployer, b"ReceiptToken");
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            receipt_constructor, option::none(), string::utf8(b"Vault Receipt Token"), string::utf8(b"vUSD"), 6, string::utf8(b""), string::utf8(b"")
        );
        let reward_constructor = &object::create_named_object(deployer, b"RewardToken");
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            reward_constructor, option::none(), string::utf8(b"Protocol Reward Token"), string::utf8(b"RWD"), 6, string::utf8(b""), string::utf8(b"")
        );

        move_to(deployer, Pool {
            total_supplied: 0,
            receipt_token_mint_ref: fungible_asset::generate_mint_ref(receipt_constructor),
            receipt_token_burn_ref: fungible_asset::generate_burn_ref(receipt_constructor),
            reward_token_mint_ref: fungible_asset::generate_mint_ref(reward_constructor),
        });
    }
}