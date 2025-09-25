module vault_addr::vault {
    use std::signer;
    use aptos_framework::fungible_asset::Metadata;
    use aptos_std::table::{Self, Table};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account::{Self, SignerCapability};
    use aptos_framework::object::{Object};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::timestamp;
    use vault_addr::strategy;
    use vault_addr::lending_protocol::{ReceiptToken, RewardToken};
    use vault_addr::mock_coins::{USDC};

    const EZERO_DEPOSIT_AMOUNT: u64 = 2;
    const ENO_STAKE_FOUND: u64 = 3;
    const ESTAKE_IS_LOCKED: u64 = 4;
    const EINVALID_DURATION: u64 = 5;
    const ESTAKE_ALREADY_EXISTS: u64 = 6;
    const ONE_MONTH_SECS: u64 = 2592000;
    const SIX_MONTHS_SECS: u64 = 15778463;
    const YIELD_TIER_1_BPS: u128 = 300; // 3.00%
    const YIELD_TIER_2_BPS: u128 = 500; // 5.00%
    const SECONDS_IN_YEAR: u128 = 31536000;
    const BASIS_POINTS_DENOMINATOR: u128 = 10000;

    struct AdminCap has key { resource_cap: SignerCapability }
    struct Stake has store, drop, copy { principal: u64, total_return: u64, unlock_timestamp_secs: u64 }
    struct EventStore<phantom AssetType> has key { deposit_events: EventHandle<DepositEvent>, withdrawal_events: EventHandle<WithdrawalEvent> }
    struct Vault<phantom AssetType: key> has key { total_deposits: u128, user_stakes: Table<address, Stake>, strategy: Object<strategy::Strategy<USDC, ReceiptToken, RewardToken>> }

    #[event]
    struct DepositEvent has drop, store { user: address, amount: u64, duration_secs: u64, total_return: u64 }
    #[event]
    struct WithdrawalEvent has drop, store { user: address, amount_withdrawn: u64 }

    public entry fun initialize<AssetType: key>(deployer: &signer, metadata: Object<Metadata>) {
        let (vault_signer, resource_cap) = account::create_resource_account(deployer, b"vault_account");
        let deployer_addr = signer::address_of(deployer);
        let strategy_object = strategy::initialize<USDC, ReceiptToken, RewardToken>(&vault_signer, deployer_addr, metadata);
        
        move_to(&vault_signer, Vault<AssetType> { total_deposits: 0, user_stakes: table::new(), strategy: strategy_object });
        move_to(&vault_signer, EventStore<AssetType> { deposit_events: account::new_event_handle<DepositEvent>(&vault_signer), withdrawal_events: account::new_event_handle<WithdrawalEvent>(&vault_signer) });
        move_to(deployer, AdminCap { resource_cap });
    }

    public entry fun deposit<AssetType: key>(user: &signer, metadata: Object<Metadata>, amount: u64, duration_secs: u64) acquires Vault, EventStore {
        let user_addr = signer::address_of(user);
        assert!(amount > 0, EZERO_DEPOSIT_AMOUNT);
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        let vault = borrow_global_mut<Vault<AssetType>>(vault_addr);
        let event_store = borrow_global_mut<EventStore<AssetType>>(vault_addr);
        assert!(!table::contains(&vault.user_stakes, user_addr), ESTAKE_ALREADY_EXISTS);

        let asset = primary_fungible_store::withdraw(user, metadata, amount);
        strategy::deposit(vault.strategy, asset);

        let yield_rate_bps = if (duration_secs == ONE_MONTH_SECS) { YIELD_TIER_1_BPS } else if (duration_secs == SIX_MONTHS_SECS) { YIELD_TIER_2_BPS } else { abort EINVALID_DURATION };
        let yield_earned = (amount as u128) * yield_rate_bps * (duration_secs as u128) / SECONDS_IN_YEAR / BASIS_POINTS_DENOMINATOR;
        let total_return = amount + (yield_earned as u64);
        
        table::add(&mut vault.user_stakes, user_addr, Stake { principal: amount, total_return, unlock_timestamp_secs: timestamp::now_seconds() + duration_secs });
        vault.total_deposits = vault.total_deposits + (amount as u128);
        event::emit_event(&mut event_store.deposit_events, DepositEvent { user: user_addr, amount, duration_secs, total_return });
    }

    public entry fun withdraw<AssetType: key>(user: &signer) acquires Vault, EventStore, AdminCap {
        let user_addr = signer::address_of(user);
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        let vault = borrow_global_mut<Vault<AssetType>>(vault_addr);
        let event_store = borrow_global_mut<EventStore<AssetType>>(vault_addr);
        let admin_cap = borrow_global<AdminCap>(@vault_addr);
        let vault_signer = account::create_signer_with_capability(&admin_cap.resource_cap);

        let user_stake = table::remove(&mut vault.user_stakes, user_addr);
        assert!(timestamp::now_seconds() >= user_stake.unlock_timestamp_secs, ESTAKE_IS_LOCKED);
        
        let assets_to_return = strategy::withdraw(vault.strategy, &vault_signer, user_stake.total_return);
        primary_fungible_store::deposit(user_addr, assets_to_return);

        vault.total_deposits = vault.total_deposits - (user_stake.principal as u128);
        event::emit_event(&mut event_store.withdrawal_events, WithdrawalEvent { user: user_addr, amount_withdrawn: user_stake.total_return });
    }
    
    public entry fun harvest<AssetType: key>(_caller: &signer) acquires Vault {
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        let vault = borrow_global<Vault<AssetType>>(vault_addr);
        strategy::harvest(vault.strategy, vault_addr);
    }
    
    #[view]
    public fun get_stake<AssetType: key>(user: address): (u64, u64, u64) acquires Vault {
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        if (exists<Vault<AssetType>>(vault_addr)) {
            let vault = borrow_global<Vault<AssetType>>(vault_addr);
            if (table::contains(&vault.user_stakes, user)) {
                let stake = table::borrow(&vault.user_stakes, user);
                (stake.principal, stake.total_return, stake.unlock_timestamp_secs)
            } else { (0, 0, 0) }
        } else { (0, 0, 0) }
    }
}