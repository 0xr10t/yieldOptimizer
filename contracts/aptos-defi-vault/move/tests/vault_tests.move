#[test_only]
module vault_addr::vault_tests {
    use std::signer;
    use aptos_framework::fungible_asset::{Self, FungibleAsset, Metadata};
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::object::{Self, Object};

    // Import the modules we want to test
    use vault_addr::vault;
    use vault_addr::mock_coins::{Self, USDC};

    const DEPLOYER: address = @0x100;
    const USER: address = @0x200;

    const DEPOSIT_AMOUNT: u64 = 100 * 1_000_000; // 100 USDC with 6 decimals
    const ONE_MONTH: u64 = 2592000; // ~30 days in seconds

    /// Helper to set up the system: creates accounts, initializes the coin and the vault.
    fun setup_system(deployer: &signer) {
        account::create_account_for_test(signer::address_of(deployer));
        account::create_account_for_test(USER);
        
        // Initialize the mock USDC currency.
        mock_coins::initialize(deployer);
        
        // Get a reference to the on-chain metadata object for USDC.
        let deployer_addr = signer::address_of(deployer);
        let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
        let usdc_metadata = object::address_to_object<Metadata>(usdc_metadata_addr);
        
        // Initialize the vault to work with our mock USDC.
        vault::initialize<USDC>(deployer, usdc_metadata);
    }

    #[test(deployer = @vault_addr)]
    fun test_full_deposit_and_withdraw_cycle(deployer: &signer) {
        // 1. SETUP
        setup_system(deployer);
        let user_signer = account::create_signer_for_test(USER);
        let user_addr = signer::address_of(&user_signer);
        
        // Mint mock USDC directly to the user's account.
        mock_coins::mint(deployer, user_addr, DEPOSIT_AMOUNT);
        assert!(fungible_asset::balance<USDC>(user_addr) == DEPOSIT_AMOUNT, 1);

        // 2. DEPOSIT
        // The user withdraws the FA from their primary store to deposit it.
        let asset_to_deposit = fungible_asset::withdraw<USDC>(&user_signer, DEPOSIT_AMOUNT);
        vault::deposit<USDC>(&user_signer, asset_to_deposit, ONE_MONTH);
        assert!(fungible_asset::balance<USDC>(user_addr) == 0, 2);

        // 3. ADVANCE TIME & WITHDRAW
        timestamp::fast_forward_seconds(ONE_MONTH + 1);
        vault::withdraw<USDC>(&user_signer);

        // 4. VERIFY
        // User should have their principal back plus some yield.
        let final_balance = fungible_asset::balance<USDC>(user_addr);
        assert!(final_balance > DEPOSIT_AMOUNT, 3);
        assert!(final_balance == 100246575, 4); // 100M + (100M * 300bps * 1month_secs / year_secs / 10000)
    }

    #[test(deployer = @vault_addr), expected_failure(abort_code = vault::ESTAKE_IS_LOCKED)]
    fun test_early_withdrawal_fails(deployer: &signer) {
        // 1. SETUP & DEPOSIT
        setup_system(deployer);
        let user_signer = account::create_signer_for_test(USER);
        mock_coins::mint(deployer, signer::address_of(&user_signer), DEPOSIT_AMOUNT);
        let asset_to_deposit = fungible_asset::withdraw<USDC>(&user_signer, DEPOSIT_AMOUNT);
        vault::deposit<USDC>(&user_signer, asset_to_deposit, ONE_MONTH);

        // 2. ATTEMPT EARLY WITHDRAWAL
        // We fast-forward time, but not enough to unlock the stake.
        timestamp::fast_forward_seconds(ONE_MONTH - 10);
        vault::withdraw<USDC>(&user_signer); // This line should abort.
    }

    #[test(deployer = @vault_addr), expected_failure(abort_code = vault::ESTAKE_ALREADY_EXISTS)]
    fun test_deposit_to_existing_stake_fails(deployer: &signer) {
        // 1. SETUP & DEPOSIT
        setup_system(deployer);
        let user_signer = account::create_signer_for_test(USER);
        let user_addr = signer::address_of(&user_signer);

        mock_coins::mint(deployer, user_addr, DEPOSIT_AMOUNT);
        let first_asset = fungible_asset::withdraw<USDC>(&user_signer, DEPOSIT_AMOUNT);
        vault::deposit<USDC>(&user_signer, first_asset, ONE_MONTH);

        // 2. ATTEMPT SECOND DEPOSIT
        // Mint more coins and try to deposit again without withdrawing first.
        mock_coins::mint(deployer, user_addr, DEPOSIT_AMOUNT);
        let second_asset = fungible_asset::withdraw<USDC>(&user_signer, DEPOSIT_AMOUNT);
        vault::deposit<USDC>(&user_signer, second_asset, ONE_MONTH); // This should abort.
    }
}

