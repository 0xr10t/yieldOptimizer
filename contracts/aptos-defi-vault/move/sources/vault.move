module vault_addr::vault {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_std::table::{Self, Table};
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account::{Self, SignerCapability};

    const EVAULT_NOT_INITIALIZED: u64 = 1;
    const EZERO_DEPOSIT_AMOUNT: u64 = 2;
    const ENO_STAKE_FOUND: u64 = 3;
    const ESTAKE_IS_LOCKED: u64 = 4;
    const EINVALID_DURATION: u64 = 5;

    struct AdminCap has key {
        resource_cap: SignerCapability,
    }

    struct Stake has store, drop, copy {
        amount: u64,
        staked_at_secs: u64,
        duration_secs: u64,
        yield_rate_bps: u64,
    }
    
    struct EventStore<phantom CoinType> has key {
        deposit_events: EventHandle<DepositEvent>,
        withdrawal_events: EventHandle<WithdrawalEvent>,
    }

    struct Vault<phantom CoinType> has key {
        total_deposits: u128,
        user_stakes: Table<address, Stake>,
        deposits: Coin<CoinType>,
    }

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

    public entry fun initialize<CoinType>(deployer: &signer) {
        let (vault_signer, resource_cap) = account::create_resource_account(deployer, b"vault_account");

        move_to(&vault_signer, Vault<CoinType> {
            total_deposits: 0,
            user_stakes: table::new(),
            deposits: coin::zero<CoinType>(),
        });

        move_to(&vault_signer, EventStore<CoinType> {
            deposit_events: account::new_event_handle<DepositEvent>(&vault_signer),
            withdrawal_events: account::new_event_handle<WithdrawalEvent>(&vault_signer),
        });

        move_to(deployer, AdminCap { resource_cap });
    }

    // FIXED: Added `acquires` for older compiler
    public entry fun deposit<CoinType>(user: &signer, amount: u64, duration_secs: u64) acquires Vault, EventStore {
        let user_addr = signer::address_of(user);
        assert!(amount > 0, EZERO_DEPOSIT_AMOUNT);

        let user_coins = coin::withdraw<CoinType>(user, amount);

        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        assert!(exists<Vault<CoinType>>(vault_addr), EVAULT_NOT_INITIALIZED);

        let vault = borrow_global_mut<Vault<CoinType>>(vault_addr);
        let event_store = borrow_global_mut<EventStore<CoinType>>(vault_addr);

        coin::merge(&mut vault.deposits, user_coins);

        let yield_rate_bps = if (duration_secs >= 15778463) { 500 }
                             else if (duration_secs >= 2592000) { 300 }
                             else { abort EINVALID_DURATION };

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

    // FIXED: Added `acquires` for older compiler
    public entry fun withdraw<CoinType>(user: &signer) acquires Vault, EventStore {
        let user_addr = signer::address_of(user);
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        assert!(exists<Vault<CoinType>>(vault_addr), EVAULT_NOT_INITIALIZED);

        let vault = borrow_global_mut<Vault<CoinType>>(vault_addr);
        let event_store = borrow_global_mut<EventStore<CoinType>>(vault_addr);

        assert!(table::contains(&vault.user_stakes, user_addr), ENO_STAKE_FOUND);
        let user_stake = table::remove(&mut vault.user_stakes, user_addr);

        let now = timestamp::now_seconds();
        assert!(now >= user_stake.staked_at_secs + user_stake.duration_secs, ESTAKE_IS_LOCKED);

        let principal = user_stake.amount;
        let elapsed_time = now - user_stake.staked_at_secs;
        let year_in_secs = 31536000;
        let yield_earned = (principal as u128) * (user_stake.yield_rate_bps as u128) * (elapsed_time as u128)
            / (year_in_secs as u128) / 10000;

        let amount_to_withdraw = principal + (yield_earned as u64);
        let coins_to_return = coin::extract(&mut vault.deposits, amount_to_withdraw);
        coin::deposit(user_addr, coins_to_return);

        vault.total_deposits = vault.total_deposits - (principal as u128);

        event::emit_event(&mut event_store.withdrawal_events, WithdrawalEvent {
            user: user_addr,
            principal_amount: principal,
            yield_amount: (yield_earned as u64),
        });
    }

    // FIXED: Added `acquires` for older compiler
    #[view]
    public fun get_stake<CoinType>(user: address): (u64, u64, u64) acquires Vault {
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        if (exists<Vault<CoinType>>(vault_addr)) {
            let vault = borrow_global<Vault<CoinType>>(vault_addr);
            if (table::contains(&vault.user_stakes, user)) {
                let stake = table::borrow(&vault.user_stakes, user);
                (stake.amount, stake.staked_at_secs, stake.duration_secs)
            } else { (0, 0, 0) }
        } else { (0, 0, 0) }
    }

    // FIXED: Added `acquires` for older compiler
    #[view]
    public fun total_deposits<CoinType>(): u128 acquires Vault {
        let vault_addr = account::create_resource_address(&@vault_addr, b"vault_account");
        if (exists<Vault<CoinType>>(vault_addr)) {
            borrow_global<Vault<CoinType>>(vault_addr).total_deposits
        } else { 0 }
    }
}

