module vault_addr::lending_protocol {
    use std::signer;
    use std::string;
    use std::option;
    use aptos_framework::fungible_asset::{Self, FungibleAsset, Metadata, MintRef, BurnRef};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::account;
    
    // These structs represent the tokens for our mock protocol
    struct ReceiptToken has key, store, drop {}
    struct RewardToken has key, store, drop {}

    /// The main resource for our mock lending pool.
    struct Pool has key {
        total_supplied: u128,
        // The pool holds capabilities to mint/burn its own receipt and reward tokens.
        receipt_token_mint_ref: MintRef,
        receipt_token_burn_ref: BurnRef,
        reward_token_mint_ref: MintRef,
    }
    
    /// Mocks depositing an asset and receiving a receipt token.
    public fun deposit(pool_addr: address, asset_to_supply: FungibleAsset): FungibleAsset {
        let pool = borrow_global_mut<Pool>(pool_addr);
        let amount = fungible_asset::amount(&asset_to_supply);
        // In a real protocol, `asset_to_supply` would be stored. Here we just burn it.
        fungible_asset::burn(asset_to_supply); 
        pool.total_supplied = pool.total_supplied + (amount as u128);
        // Mint and return a receipt token of equal value.
        fungible_asset::mint(&pool.receipt_token_mint_ref, amount)
    }

    /// Mocks returning an asset by burning a receipt token.
    public fun withdraw(pool_addr: address, receipt_asset: FungibleAsset, metadata: Object<Metadata>): FungibleAsset {
        let pool = borrow_global_mut<Pool>(pool_addr);
        let amount = fungible_asset::amount(&receipt_asset);
        fungible_asset::burn(&pool.receipt_token_burn_ref, receipt_asset);
        pool.total_supplied = pool.total_supplied - (amount as u128);
        // Mint the underlying asset back to the user.
        fungible_asset::mint_from_metadata(metadata, amount)
    }

    /// Mocks claiming a fixed amount of rewards.
    public fun claim_rewards(pool_addr: address): FungibleAsset {
        let pool = borrow_global<Pool>(pool_addr);
        fungible_asset::mint(&pool.reward_token_mint_ref, 10 * 1_000_000)
    }

    #[view]
    public fun get_receipt_token_metadata(pool_addr: address): Object<Metadata> {
        let pool = borrow_global<Pool>(pool_addr);
        fungible_asset::mint_ref_metadata(&pool.receipt_token_mint_ref)
    }

    #[test_only]
    public fun initialize_mock_protocol(deployer: &signer) {
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