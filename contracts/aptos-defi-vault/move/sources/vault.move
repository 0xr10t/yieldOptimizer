module vault_addr::vault {
    use std::signer;
    use aptos_framework::fungible_asset::{Self, Metadata, FungibleStore};
    use aptos_std::table::{Self, Table};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account::{Self, SignerCapability};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;

    // === Errors ===
    const EVAULT_NOT_INITIALIZED: u64 = 1;
    const EZERO_DEPOSIT_AMOUNT: u64 = 2;
    const ENO_STAKE_FOUND: u64 = 3;
    const ESTAKE_IS_LOCKED: u64 = 4;
    const EINVALID_DURATION: u64 = 5; // Re-introducing duration error
    const ESTAKE_ALREADY_EXISTS: u64 = 6;
    const E_NOT_ADMIN: u64 = 7;

    // === Constants ===
    // ADDED: Constants for our tiered yield strategy
    const ONE_MONTH_SECS: u64 = 2592000;
    const SIX_MONTHS_SECS: u64 = 15778463;
    const YIELD_TIER_1_BPS: u128 = 300; // 3%
    const YIELD_TIER_2_BPS: u128 = 500; // 5%

    const SECONDS_IN_YEAR: u128 = 31536000;
    const BASIS_POINTS_DENOMINATOR: u128 = 10000;

    // === Structs ===
    struct AdminCap has key {
        resource_cap: SignerCapability,
    }

    // FIXED: Added `duration_secs` back to the Stake to track the user's choice.
    struct Stake has store, drop, copy {
        principal: u64,
        total_return: u64,
        duration_secs: u64,
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
    #[event]
    struct DepositEvent has drop, store { user: address, amount: u64, duration_secs: u64, total_return: u64 }
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

    // FIXED: `deposit` now takes a `duration_secs` argument from the user.
    public entry fun deposit<AssetType: key>(
        user: &signer,
        metadata: Object<Metadata>,
        amount: u64,
        duration_secs: u64,
    ) acquires Vault, EventStore {
        let user_addr = signer::address_of(user);
        assert!(amount > 0, EZERO_DEPOSIT_AMOUNT);

        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        let vault = borrow_global_mut<Vault<AssetType>>(vault_addr);
        let event_store = borrow_global_mut<EventStore<AssetType>>(vault_addr);

        assert!(!table::contains(&vault.user_stakes, user_addr), ESTAKE_ALREADY_EXISTS);

        let asset = primary_fungible_store::withdraw(user, metadata, amount);
        fungible_asset::deposit(vault.deposits, asset);

        // FIXED: Calculate yield based on the selected duration tier.
        let yield_rate_bps = if (duration_secs == ONE_MONTH_SECS) {
            YIELD_TIER_1_BPS
        } else if (duration_secs == SIX_MONTHS_SECS) {
            YIELD_TIER_2_BPS
        } else {
            abort EINVALID_DURATION
        };

        // Note: This is a simplified APY calculation for the hackathon.
        let yield_earned = (amount as u128) * yield_rate_bps * (duration_secs as u128)
            / SECONDS_IN_YEAR / BASIS_POINTS_DENOMINATOR;
        let total_return = amount + (yield_earned as u64);

        table::add(&mut vault.user_stakes, user_addr, Stake {
            principal: amount,
            total_return,
            duration_secs,
            is_locked: true,
        });
        vault.total_deposits = vault.total_deposits + (amount as u128);
        event::emit_event(&mut event_store.deposit_events, DepositEvent {
            user: user_addr,
            amount,
            duration_secs,
            total_return
        });
    }

    // ... (unlock_stake, withdraw, and get_stake are unchanged from Plan B) ...
    public entry fun unlock_stake<AssetType: key>(user: &signer) acquires Vault {
        let user_addr = signer::address_of(user);
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        let vault = borrow_global_mut<Vault<AssetType>>(vault_addr);
        assert!(table::contains(&vault.user_stakes, user_addr), ENO_STAKE_FOUND);

        let user_stake = table::borrow_mut(&mut vault.user_stakes, user_addr);
        user_stake.is_locked = false;
    }

    public entry fun withdraw<AssetType: key>(user: &signer, metadata: Object<Metadata>) acquires Vault, EventStore, AdminCap {
        let user_addr = signer::address_of(user);
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        let vault = borrow_global_mut<Vault<AssetType>>(vault_addr);
        let event_store = borrow_global_mut<EventStore<AssetType>>(vault_addr);
        
        let admin_cap = borrow_global<AdminCap>(@vault_addr);
        let vault_signer = account::create_signer_with_capability(&admin_cap.resource_cap);

        assert!(table::contains(&vault.user_stakes, user_addr), ENO_STAKE_FOUND);
        let user_stake = table::remove(&mut vault.user_stakes, user_addr);
        assert!(!user_stake.is_locked, ESTAKE_IS_LOCKED);
        
        let principal_asset = fungible_asset::withdraw(&vault_signer, vault.deposits, user_stake.principal);
        
        let yield_amount = user_stake.total_return - user_stake.principal;
        let yield_asset = primary_fungible_store::withdraw(&vault_signer, metadata, yield_amount);

        fungible_asset::merge(&mut principal_asset, yield_asset);

        primary_fungible_store::deposit(user_addr, principal_asset);

        vault.total_deposits = vault.total_deposits - (user_stake.principal as u128);
        event::emit_event(&mut event_store.withdrawal_events, WithdrawalEvent { user: user_addr, amount_withdrawn: user_stake.total_return });
    }
    
    #[view]
    public fun get_stake<AssetType: key>(user: address): (u64, u64, u64, bool) acquires Vault {
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        if (exists<Vault<AssetType>>(vault_addr)) {
            let vault = borrow_global<Vault<AssetType>>(vault_addr);
            if (table::contains(&vault.user_stakes, user)) {
                let stake = table::borrow(&vault.user_stakes, user);
                (stake.principal, stake.total_return, stake.duration_secs, stake.is_locked)
            } else { (0, 0, 0, false) }
        } else { (0, 0, 0, false) }
    }
}