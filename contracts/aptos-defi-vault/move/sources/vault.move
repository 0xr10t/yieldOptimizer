module vault_addr::vault {
    use std::signer;
    use aptos_framework::fungible_asset::{Self, Metadata, FungibleStore};
    use aptos_std::table::{Self, Table};
    // REMOVED: No longer using the timestamp module.
    // use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account::{Self, SignerCapability};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;

    // === Errors ===
    const EVAULT_NOT_INITIALIZED: u64 = 1;
    const EZERO_DEPOSIT_AMOUNT: u64 = 2;
    const ENO_STAKE_FOUND: u64 = 3;
    const ESTAKE_IS_LOCKED: u64 = 4;
    // REMOVED: No longer using duration.
    // const EINVALID_DURATION: u64 = 5;
    const ESTAKE_ALREADY_EXISTS: u64 = 6;
    const E_NOT_ADMIN: u64 = 7;

    // === Constants ===
    // REMOVED: No longer using time-based yield.
    // const SECONDS_IN_YEAR: u128 = 31536000;
    const BASIS_POINTS_DENOMINATOR: u128 = 10000;
    // ADDED: A simple, fixed yield rate for Plan B. (e.g., 3%)
    const FIXED_YIELD_RATE_BPS: u128 = 300;

    // === Structs ===

    struct AdminCap has key {
        resource_cap: SignerCapability,
    }

    // FIXED: Replaced timestamp with a simple is_locked flag.
    struct Stake has store, drop, copy {
        principal: u64,
        total_return: u64,
        is_locked: bool,
    }

    struct EventStore<phantom AssetType> has key {
        deposit_events: EventHandle<DepositEvent>,
        withdrawal_events: EventHandle<WithdrawalEvent>,
    }

    struct Vault<phantom AssetType: key> has key {
        total_deposits: u128,
        user_stakes: Table<address, Stake>,
        deposits: Object<FungibleStore>,
    }

    // === Events ===
    // FIXED: Removed duration from the deposit event.
    #[event]
    struct DepositEvent has drop, store { user: address, amount: u64, total_return: u64 }
    #[event]
    struct WithdrawalEvent has drop, store { user: address, amount_withdrawn: u64 }

    // === Public Functions ===

    public entry fun initialize<AssetType: key>(deployer: &signer, metadata: Object<Metadata>) {
        let (vault_signer, resource_cap) = account::create_resource_account(deployer, b"vault_account");
        let constructor_ref = object::create_object_from_account(&vault_signer);

        move_to(&vault_signer, Vault<AssetType> {
            total_deposits: 0,
            user_stakes: table::new(),
            deposits: fungible_asset::create_store(&constructor_ref, metadata),
        });
        move_to(&vault_signer, EventStore<AssetType> {
            deposit_events: account::new_event_handle<DepositEvent>(&vault_signer),
            withdrawal_events: account::new_event_handle<WithdrawalEvent>(&vault_signer),
        });
        move_to(deployer, AdminCap { resource_cap });
    }

    // FIXED: Signature changed. No longer takes `duration_secs`. Now takes metadata object.
    public entry fun deposit<AssetType: key>(
        user: &signer,
        metadata: Object<Metadata>,
        amount: u64,
    ) acquires Vault, EventStore {
        let user_addr = signer::address_of(user);
        assert!(amount > 0, EZERO_DEPOSIT_AMOUNT);

        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        let vault = borrow_global_mut<Vault<AssetType>>(vault_addr);
        let event_store = borrow_global_mut<EventStore<AssetType>>(vault_addr);

        assert!(!table::contains(&vault.user_stakes, user_addr), ESTAKE_ALREADY_EXISTS);

        let asset = primary_fungible_store::withdraw(user, metadata, amount);
        fungible_asset::deposit(vault.deposits, asset);

        // FIXED: Simplified yield calculation to a fixed rate.
        let yield_earned = (amount as u128) * FIXED_YIELD_RATE_BPS / BASIS_POINTS_DENOMINATOR;
        let total_return = amount + (yield_earned as u64);

        table::add(&mut vault.user_stakes, user_addr, Stake {
            principal: amount,
            total_return,
            is_locked: true, // Stake is locked on deposit
        });
        vault.total_deposits = vault.total_deposits + (amount as u128);
        event::emit_event(&mut event_store.deposit_events, DepositEvent {
            user: user_addr,
            amount,
            total_return
        });
    }

    // ADDED: New function to allow a user to unlock their own stake.
    public entry fun unlock_stake<AssetType: key>(user: &signer) acquires Vault {
        let user_addr = signer::address_of(user);
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        let vault = borrow_global_mut<Vault<AssetType>>(vault_addr);
        assert!(table::contains(&vault.user_stakes, user_addr), ENO_STAKE_FOUND);

        let user_stake = table::borrow_mut(&mut vault.user_stakes, user_addr);
        user_stake.is_locked = false;
    }

    public entry fun withdraw<AssetType: key>(user: &signer) acquires Vault, EventStore, AdminCap {
        let user_addr = signer::address_of(user);
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        let vault = borrow_global_mut<Vault<AssetType>>(vault_addr);
        let event_store = borrow_global_mut<EventStore<AssetType>>(vault_addr);
        
        let admin_cap = borrow_global<AdminCap>(@vault_addr);
        let vault_signer = account::create_signer_with_capability(&admin_cap.resource_cap);

        assert!(table::contains(&vault.user_stakes, user_addr), ENO_STAKE_FOUND);
        let user_stake = table::remove(&mut vault.user_stakes, user_addr);

        // FIXED: Check the `is_locked` flag instead of the timestamp.
        assert!(!user_stake.is_locked, ESTAKE_IS_LOCKED);
        
        let assets_to_return = fungible_asset::withdraw(&vault_signer, vault.deposits, user_stake.total_return);
        primary_fungible_store::deposit(user_addr, assets_to_return);

        vault.total_deposits = vault.total_deposits - (user_stake.principal as u128);
        event::emit_event(&mut event_store.withdrawal_events, WithdrawalEvent { user: user_addr, amount_withdrawn: user_stake.total_return });
    }

    // FIXED: Updated view function to return the new Stake fields.
    #[view]
    public fun get_stake<AssetType: key>(user: address): (u64, u64, bool) acquires Vault {
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        if (exists<Vault<AssetType>>(vault_addr)) {
            let vault = borrow_global<Vault<AssetType>>(vault_addr);
            if (table::contains(&vault.user_stakes, user)) {
                let stake = table::borrow(&vault.user_stakes, user);
                (stake.principal, stake.total_return, stake.is_locked)
            } else { (0, 0, false) }
        } else { (0, 0, false) }
    }
}