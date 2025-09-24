// sources/strategy.move
module vault_addr::strategy {
    use aptos_framework::fungible_asset::{Self, FungibleAsset, Metadata, FungibleStore};
    use aptos_framework::object::{Self, Object};
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
        let strategy_object = object::object_from_constructor_ref<Strategy<WantType, ReceiptType, RewardType>>(constructor_ref);
        move_to(strategy_owner, Strategy<WantType, ReceiptType, RewardType> {
            pool_addr,
            want_metadata,
            receipt_token_store: fungible_asset::create_store(constructor_ref, receipt_token_metadata),
        });
        strategy_object
    }

    public fun deposit<WantType, ReceiptType, RewardType>(
        strategy_obj: Object<Strategy<WantType, ReceiptType, RewardType>>,
        asset_to_deposit: FungibleAsset,
    ) acquires Strategy {
        let strategy = borrow_global<Strategy<WantType, ReceiptType, RewardType>>(object::object_address(&strategy_obj));
        let receipt_asset = lending_protocol::deposit(strategy.pool_addr, asset_to_deposit);
        fungible_asset::deposit(strategy.receipt_token_store, receipt_asset);
    }

    public fun withdraw<WantType, ReceiptType, RewardType>(
        strategy_obj: Object<Strategy<WantType, ReceiptType, RewardType>>,
        strategy_signer: &signer,
        amount_to_withdraw: u64,
    ): FungibleAsset acquires Strategy {
        let strategy = borrow_global<Strategy<WantType, ReceiptType, RewardType>>(object::object_address(&strategy_obj));
        let receipt_asset = fungible_asset::withdraw(strategy_signer, strategy.receipt_token_store, amount_to_withdraw);
        lending_protocol::withdraw(strategy.pool_addr, receipt_asset)
    }

    public fun harvest<WantType, ReceiptType, RewardType>(
        strategy_obj: Object<Strategy<WantType, ReceiptType, RewardType>>,
        vault_treasury_addr: address,
    ) acquires Strategy {
        let strategy = borrow_global<Strategy<WantType, ReceiptType, RewardType>>(object::object_address(&strategy_obj));
        let reward_asset = lending_protocol::claim_rewards(strategy.pool_addr);
        aptos_framework::primary_fungible_store::deposit(vault_treasury_addr, reward_asset);
    }
    
}