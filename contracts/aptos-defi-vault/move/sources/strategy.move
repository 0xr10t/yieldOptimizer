module vault_addr::strategy {
    use aptos_framework::fungible_asset::{Self, FungibleAsset, Metadata, FungibleStore};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;
    use vault_addr::lending_protocol;

    struct Strategy<phantom WantType, phantom ReceiptType, phantom RewardType> has key {
        pool_addr: address,
        want_metadata: Object<Metadata>,
        receipt_token_store: Object<FungibleStore>,
    }

    public fun initialize<WantType: key, ReceiptType: key, RewardType: key>(
        strategy_owner: &signer,
        pool_addr: address,
        want_metadata: Object<Metadata>,
    ): Object<Strategy<WantType, ReceiptType, RewardType>> {
        let receipt_token_metadata = lending_protocol::get_receipt_token_metadata(pool_addr);
        let constructor_ref = &object::create_object_from_account(strategy_owner);
        let strategy_signer = object::generate_signer(constructor_ref);

        move_to(&strategy_signer, Strategy<WantType, ReceiptType, RewardType> {
            pool_addr,
            want_metadata,
            receipt_token_store: fungible_asset::create_store(constructor_ref, receipt_token_metadata),
        });
        object::object_from_constructor_ref<Strategy<WantType, ReceiptType, RewardType>>(constructor_ref)
    }

    public fun deposit<WantType, ReceiptType, RewardType>(
        strategy_obj: Object<Strategy<WantType, ReceiptType, RewardType>>,
        asset_to_deposit: FungibleAsset,
    ) acquires Strategy {
        let strategy_addr = object::object_address(&strategy_obj);
        let strategy = borrow_global<Strategy<WantType, ReceiptType, RewardType>>(strategy_addr);
        let receipt_asset = lending_protocol::deposit(strategy.pool_addr, asset_to_deposit);
        fungible_asset::deposit(strategy.receipt_token_store, receipt_asset);
    }

    public fun withdraw<WantType: key, ReceiptType, RewardType>(
        strategy_obj: Object<Strategy<WantType, ReceiptType, RewardType>>,
        strategy_signer: &signer,
        amount_to_withdraw: u64,
    ): FungibleAsset acquires Strategy {
        let strategy_addr = object::object_address(&strategy_obj);
        let strategy = borrow_global<Strategy<WantType, ReceiptType, RewardType>>(strategy_addr);
        let receipt_asset = fungible_asset::withdraw(strategy_signer, strategy.receipt_token_store, amount_to_withdraw);
        lending_protocol::withdraw(strategy.pool_addr, receipt_asset, strategy.want_metadata)
    }

    public fun harvest<WantType, ReceiptType, RewardType>(
        strategy_obj: Object<Strategy<WantType, ReceiptType, RewardType>>,
        vault_treasury_addr: address,
    ) acquires Strategy {
        let strategy_addr = object::object_address(&strategy_obj);
        let strategy = borrow_global<Strategy<WantType, ReceiptType, RewardType>>(strategy_addr);
        let reward_asset = lending_protocol::claim_rewards(strategy.pool_addr);
        primary_fungible_store::deposit(vault_treasury_addr, reward_asset);
    }

    #[view]
    public fun get_receipt_token_balance<WantType, ReceiptType, RewardType>(
        strategy_obj: Object<Strategy<WantType, ReceiptType, RewardType>>
    ): u64 acquires Strategy {
        let strategy_addr = object::object_address(&strategy_obj);
        let strategy = borrow_global<Strategy<WantType, ReceiptType, RewardType>>(strategy_addr);
        fungible_asset::balance(strategy.receipt_token_store)
    }
}