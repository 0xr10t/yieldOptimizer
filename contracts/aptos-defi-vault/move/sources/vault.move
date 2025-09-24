/// This module implements a secure savings vault on the Aptos blockchain.
/// It allows users to deposit and stake fungible assets (like stablecoins)
/// for a specified duration to earn yield.
module vault_addr::vault {
    // === Imports ===
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_std::table::{Self, Table};
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account::{Self, SignerCapability};

    // === Errors ===
    const EVAULT_NOT_INITIALIZED: u64 = 1;
    const EZERO_DEPOSIT_AMOUNT: u64 = 2;
    const ENO_STAKE_FOUND: u64 = 3;
    const ESTAKE_IS_LOCKED: u64 = 4;
    const EINVALID_DURATION: u64 = 5;

    // === Structs ===

    /// A capability held by the deployer to prove administrative authority.
    /// It contains the `SignerCapability` for the resource account that holds the Vault,
    /// allowing the admin to sign transactions on its behalf if needed for upgrades.
    struct AdminCap has key {
        resource_cap: SignerCapability,
    }

    /// Represents a user's staked position in the vault.
    /// This struct has `store` so it can be a value in the `Table`.
    struct Stake has store, drop, copy {
        amount: u64,
        staked_at_secs: u64,
        duration_secs: u64,
        yield_rate_bps: u64, // e.g., 500 = 5.00%
    }
    
    /// A dedicated resource to hold event handles.
    /// This is necessary because EventHandle does not have the `store` ability
    /// and cannot be placed inside the main Vault struct.
    struct EventStore<phantom CoinType> has key {
        deposit_events: EventHandle<DepositEvent>,
        withdrawal_events: EventHandle<WithdrawalEvent>,
    }

    /// The main Vault resource. It holds all deposited funds and user stake data.
    /// This is a singleton resource stored under its own dedicated resource account.
    struct Vault<phantom CoinType> has key {
        total_deposits: u128,
        user_stakes: Table<address, Stake>,
        // The Vault holds a `Coin` resource directly to store the pooled funds.
        deposits: Coin<CoinType>,
    }

    // === Events ===

    #[event]
    struct DepositEvent has drop, store {
        user: address,
        amount: u64,
        duration_secs: u64,
    }
    #[event]
    struct WithdrawalEvent has drop, store {
        user: address,
        principal_amount: u64,
        yield_amount: u64,
    }

    // === Public Functions ===

    /// Must be called once by the deployer to initialize the vault.
    /// Creates a resource account to securely store the vault's assets and data.
    public entry fun initialize<CoinType>(deployer: &signer) {
        // Create a new resource account controlled by this module.
        // It returns a signer for that account and a capability to manage it.
        let (vault_signer, resource_cap) = account::create_resource_account(deployer, b"vault_account");

        // `move_to` places the Vault resource under the new resource account's address.
        move_to(&vault_signer, Vault<CoinType> {
            total_deposits: 0,
            user_stakes: table::new(),
            deposits: coin::zero<CoinType>(),
        });

        // Also place the EventStore resource under the same account.
        move_to(&vault_signer, EventStore<CoinType> {
            deposit_events: account::new_event_handle<DepositEvent>(&vault_signer),
            withdrawal_events: account::new_event_handle<WithdrawalEvent>(&vault_signer),
        });

        // Transfer the AdminCap to the original deployer so they can manage the vault.
        move_to(deployer, AdminCap { resource_cap });
    }

    /// Allows a user to deposit a `Coin` and stake it for a specific duration.
    public entry fun deposit<CoinType>(user: &signer, amount: u64, duration_secs: u64) {
        let user_addr = signer::address_of(user);
        assert!(amount > 0, EZERO_DEPOSIT_AMOUNT);

        // Withdraw the specified amount from the user's account.
        let user_coins = coin::withdraw<CoinType>(user, amount);

        // Deterministically calculate the vault's on-chain address.
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        assert!(exists<Vault<CoinType>>(vault_addr), EVAULT_NOT_INITIALIZED);

        // Borrow mutable references to the global resources stored at the vault's address.
        let vault = borrow_global_mut<Vault<CoinType>>(vault_addr);
        let event_store = borrow_global_mut<EventStore<CoinType>>(vault_addr);

        // Merge the user's coins into the vault's central coin pile.
        coin::merge(&mut vault.deposits, user_coins);

        // Simple tiered yield model.
        let yield_rate_bps = if (duration_secs >= 15778463) { // ~6 months
            500 // 5.00%
        } else if (duration_secs >= 2592000) { // ~1 month
            300 // 3.00%
        } else {
            abort EINVALID_DURATION
        };

        // If the user already has a stake, we add to it.
        // A more advanced vault could manage multiple, separate stakes per user.
        if (table::contains(&vault.user_stakes, user_addr)) {
            let existing_stake = table::borrow_mut(&mut vault.user_stakes, user_addr);
            existing_stake.amount = existing_stake.amount + amount;
        } else {
            let new_stake = Stake {
                amount,
                staked_at_secs: timestamp::now_seconds(),
                duration_secs,
                yield_rate_bps,
            };
            table::add(&mut vault.user_stakes, user_addr, new_stake);
        };

        vault.total_deposits = vault.total_deposits + (amount as u128);
        event::emit_event(&mut event_store.deposit_events, DepositEvent { user: user_addr, amount, duration_secs });
    }

    /// Allows a user to withdraw their principal and accrued yield after the lockup period.
    public entry fun withdraw<CoinType>(user: &signer) {
        let user_addr = signer::address_of(user);
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        assert!(exists<Vault<CoinType>>(vault_addr), EVAULT_NOT_INITIALIZED);

        let vault = borrow_global_mut<Vault<CoinType>>(vault_addr);
        let event_store = borrow_global_mut<EventStore<CoinType>>(vault_addr);

        assert!(table::contains(&vault.user_stakes, user_addr), ENO_STAKE_FOUND);
        let user_stake = table::remove(&mut vault.user_stakes, user_addr);

        let now = timestamp::now_seconds();
        assert!(now >= user_stake.staked_at_secs + user_stake.duration_secs, ESTAKE_IS_LOCKED);

        // Simplified annual yield calculation based on elapsed time.
        let principal = user_stake.amount;
        let elapsed_time = now - user_stake.staked_at_secs;
        let year_in_secs = 31536000;
        let yield_earned = (principal as u128) * (user_stake.yield_rate_bps as u128) * (elapsed_time as u128)
            / (year_in_secs as u128) / 10000;

        let amount_to_withdraw = principal + (yield_earned as u64);
        let coins_to_return = coin::extract(&mut vault.deposits, amount_to_withdraw);
        
        // Deposit the final amount back into the user's primary account.
        coin::deposit(user_addr, coins_to_return);

        vault.total_deposits = vault.total_deposits - (principal as u128);

        event::emit_event(&mut event_store.withdrawal_events, WithdrawalEvent {
            user: user_addr,
            principal_amount: principal,
            yield_amount: (yield_earned as u64),
        });
    }

    // === View Functions ===

    #[view]
    public fun get_stake<CoinType>(user: address): (u64, u64, u64) {
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        if (exists<Vault<CoinType>>(vault_addr)) {
            let vault = borrow_global<Vault<CoinType>>(vault_addr);
            if (table::contains(&vault.user_stakes, user)) {
                let stake = table::borrow(&vault.user_stakes, user);
                (stake.amount, stake.staked_at_secs, stake.duration_secs)
            } else { (0, 0, 0) }
        } else { (0, 0, 0) }
    }

    #[view]
    public fun total_deposits<CoinType>(): u128 {
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        if (exists<Vault<CoinType>>(vault_addr)) {
            borrow_global<Vault<CoinType>>(vault_addr).total_deposits
        } else { 0 }
    }
}
