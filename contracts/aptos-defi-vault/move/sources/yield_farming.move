module vault_addr::yield_farming {
    use std::signer;
    use std::table;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;

    /// Events
    struct DepositEvent has store, drop { user: address, amount: u64 }
    struct WithdrawEvent has store, drop { user: address, amount: u64 }
    struct ClaimEvent has store, drop { user: address, amount: u64 }

    /// Information about a single user’s stake
    struct StakeInfo has store, drop {
        balance: u64,
        rewards_accrued: u64,
        user_reward_per_token_paid: u128,
    }

    /// Pool resource for a given staked coin type
    struct Pool<phantom CoinType> has key {
        admin: address,
        total_staked: u64,
        reward_rate_per_second: u64,
        last_update_time: u64,
        reward_per_token_stored: u128,
        stakes: table::Table<address, StakeInfo>,
        deposit_events: EventHandle<DepositEvent>,
        withdraw_events: EventHandle<WithdrawEvent>,
        claim_events: EventHandle<ClaimEvent>,
    }

    /// Initialize a new yield farming pool for CoinType with a reward rate per second.
    /// The pool resource is stored under the `admin`'s address.
    public entry fun initialize<CoinType: store>(admin: &signer, reward_rate_per_second: u64) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<Pool<CoinType>>(admin_addr), 1);
        let now = timestamp::now_seconds();

        let deposit_events = account::new_event_handle<DepositEvent>(admin);
        let withdraw_events = account::new_event_handle<WithdrawEvent>(admin);
        let claim_events = account::new_event_handle<ClaimEvent>(admin);

        move_to(admin, Pool<CoinType> {
            admin: admin_addr,
            total_staked: 0,
            reward_rate_per_second,
            last_update_time: now,
            reward_per_token_stored: 0,
            stakes: table::new<address, StakeInfo>(),
            deposit_events,
            withdraw_events,
            claim_events,
        });
    }

    /// Register a user in the pool so their stake record exists.
    // FIXED: Reordered parameters to place `user: &signer` first.
    public entry fun register_user<CoinType: store>(user: &signer, pool_addr: address) acquires Pool {
        let pool = borrow_global_mut<Pool<CoinType>>(pool_addr);
        let user_addr = signer::address_of(user);
        update_reward_for<CoinType>(pool, user_addr);
        ensure_stake_exists(&mut pool.stakes, user_addr);
    }

    /// Deposit (stake) amount units for the calling signer. This demo-only version
    /// records balances without actually moving any coins.
    // FIXED: Reordered parameters to place `user: &signer` first.
    public entry fun deposit<CoinType: store>(user: &signer, pool_addr: address, amount: u64) acquires Pool {
        let pool = borrow_global_mut<Pool<CoinType>>(pool_addr);
        let user_addr = signer::address_of(user);
        assert!(amount > 0, 2);
        update_reward_for<CoinType>(pool, user_addr);
        let stake_ref = borrow_stake_mut(&mut pool.stakes, user_addr);
        stake_ref.balance = stake_ref.balance + amount;
        pool.total_staked = pool.total_staked + amount;
        event::emit_event<DepositEvent>(&mut pool.deposit_events, DepositEvent { user: user_addr, amount });
    }

    /// Withdraw (unstake) amount units for the calling signer. Demo-only accounting.
    // FIXED: Reordered parameters to place `user: &signer` first.
    public entry fun withdraw<CoinType: store>(user: &signer, pool_addr: address, amount: u64) acquires Pool {
        let pool = borrow_global_mut<Pool<CoinType>>(pool_addr);
        let user_addr = signer::address_of(user);
        assert!(amount > 0, 3);
        update_reward_for<CoinType>(pool, user_addr);
        let stake_ref = borrow_stake_mut(&mut pool.stakes, user_addr);
        assert!(stake_ref.balance >= amount, 4);
        stake_ref.balance = stake_ref.balance - amount;
        pool.total_staked = pool.total_staked - amount;
        event::emit_event<WithdrawEvent>(&mut pool.withdraw_events, WithdrawEvent { user: user_addr, amount });
    }

    /// Claim pending rewards for the caller. Rewards are accounted but not paid in any coin.
    // FIXED: Reordered parameters to place `user: &signer` first.
    public entry fun claim_rewards<CoinType: store>(user: &signer, pool_addr: address) acquires Pool {
        let pool = borrow_global_mut<Pool<CoinType>>(pool_addr);
        let user_addr = signer::address_of(user);
        update_reward_for<CoinType>(pool, user_addr);
        let stake_ref = borrow_stake_mut(&mut pool.stakes, user_addr);
        let amount = stake_ref.rewards_accrued;
        stake_ref.rewards_accrued = 0;
        event::emit_event<ClaimEvent>(&mut pool.claim_events, ClaimEvent { user: user_addr, amount });
    }

    /// ----------------- INTERNAL HELPERS -----------------

    fun ensure_stake_exists(stakes: &mut table::Table<address, StakeInfo>, user: address) {
        if (!table::contains(stakes, user)) {
            let stake = StakeInfo { balance: 0, rewards_accrued: 0, user_reward_per_token_paid: 0 };
            table::add(stakes, user, stake);
        }
    }

    fun borrow_stake_mut(stakes: &mut table::Table<address, StakeInfo>, user: address): &mut StakeInfo {
        table::borrow_mut(stakes, user)
    }

    fun reward_per_token<CoinType: store>(pool: &Pool<CoinType>): u128 {
        if (pool.total_staked == 0) {
            return pool.reward_per_token_stored
        };
        
        let now = timestamp::now_seconds();
        let time_elapsed = now - pool.last_update_time;

        if (pool.total_staked == 0) {
            pool.reward_per_token_stored
        } else {
             pool.reward_per_token_stored + ((time_elapsed as u128) * (pool.reward_rate_per_second as u128) * 1_000_000 / (pool.total_staked as u128))
        }
    }

    fun update_reward_for<CoinType: store>(pool: &mut Pool<CoinType>, user: address) {
        let rpt = reward_per_token<CoinType>(pool);
        pool.reward_per_token_stored = rpt;
        pool.last_update_time = timestamp::now_seconds();

        ensure_stake_exists(&mut pool.stakes, user);
        let stake_ref = borrow_stake_mut(&mut pool.stakes, user);
        let pending = ((stake_ref.balance as u128) * (rpt - stake_ref.user_reward_per_token_paid) / 1_000_000) as u64;
        stake_ref.rewards_accrued = stake_ref.rewards_accrued + pending;
        stake_ref.user_reward_per_token_paid = rpt;
    }
}