#[test_only]
module vault_addr::vault_tests {
    use std::signer;
    use aptos_framework::fungible_asset::{Self, Metadata}; // FIXED: Added Self for fungible_asset
    use aptos_framework::account;
    use aptos_framework::object;
    use aptos_framework::primary_fungible_store;
    // REMOVED: Unused alias 'chain_status'.
    // use aptos_framework::chain_status;

    use vault_addr::vault;
    use vault_addr::mock_coins::{Self, USDC};

    const DEPLOYER: address = @vault_addr;
    const USER_1: address = @0x200;
    // ADDED: A second user for the comparison test.
    const USER_2: address = @0x300;
    const TREASURY_AMOUNT: u64 = 1_000_000 * 1_000_000;

    const DEPOSIT_AMOUNT: u64 = 100 * 1_000_000;

    const ONE_MONTH_SECS: u64 = 2592000;
    const SIX_MONTHS_SECS: u64 = 15778463;

    fun setup_system(deployer: &signer) {
        // We don't need the test initializer for the Plan B logic.
        account::create_account_for_test(USER_1);
        account::create_account_for_test(USER_2); // Create the second user account
        mock_coins::initialize_usdc(deployer);

        let deployer_addr = signer::address_of(deployer);
        let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
        let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);

        vault::initialize<USDC>(deployer, usdc_metadata_obj);

        let vault_resource_addr = account::create_resource_address(&deployer_addr, b"vault_account");
        mock_coins::mint(deployer, vault_resource_addr, TREASURY_AMOUNT);
    }

    #[test(deployer = @vault_addr)]
    fun test_full_deposit_and_withdraw_cycle() {
        let deployer = &account::create_signer_for_test(DEPLOYER);
        setup_system(deployer);
        let user_signer = account::create_signer_for_test(USER_1);
        let user_addr = signer::address_of(&user_signer);
        mock_coins::mint(deployer, user_addr, DEPOSIT_AMOUNT);

        let deployer_addr = signer::address_of(deployer);
        let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
        let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);

        assert!(primary_fungible_store::balance(user_addr, usdc_metadata_obj) == DEPOSIT_AMOUNT, 1);
        
        vault::deposit<USDC>(&user_signer, usdc_metadata_obj, DEPOSIT_AMOUNT, ONE_MONTH_SECS);

        assert!(primary_fungible_store::balance(user_addr, usdc_metadata_obj) == 0, 2);

        vault::unlock_stake<USDC>(&user_signer);
        vault::withdraw<USDC>(&user_signer, usdc_metadata_obj);
        let final_balance = primary_fungible_store::balance(user_addr, usdc_metadata_obj);
        assert!(final_balance > DEPOSIT_AMOUNT, 3);
    }

    // FIXED: Rewrote the test to use two separate users for a clean comparison.
    #[test(deployer = @vault_addr)]
    fun test_six_month_yield_is_higher() {
        let deployer = &account::create_signer_for_test(DEPLOYER);
        setup_system(deployer);
        
        let user1_signer = account::create_signer_for_test(USER_1);
        let user1_addr = signer::address_of(&user1_signer);
        let user2_signer = account::create_signer_for_test(USER_2);
        let user2_addr = signer::address_of(&user2_signer);

        // Mint to both users
        mock_coins::mint(deployer, user1_addr, DEPOSIT_AMOUNT);
        mock_coins::mint(deployer, user2_addr, DEPOSIT_AMOUNT);

        let deployer_addr = signer::address_of(deployer);
        let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
        let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);

        // User 1 deposits for 1 month
        vault::deposit<USDC>(&user1_signer, usdc_metadata_obj, DEPOSIT_AMOUNT, ONE_MONTH_SECS);
        
        // User 2 deposits for 6 months
        vault::deposit<USDC>(&user2_signer, usdc_metadata_obj, DEPOSIT_AMOUNT, SIX_MONTHS_SECS);

        // Unlock and withdraw for both
        vault::unlock_stake<USDC>(&user1_signer);
        vault::withdraw<USDC>(&user1_signer, usdc_metadata_obj);
        let final_balance1 = primary_fungible_store::balance(user1_addr, usdc_metadata_obj);

        vault::unlock_stake<USDC>(&user2_signer);
        vault::withdraw<USDC>(&user2_signer, usdc_metadata_obj);
        let final_balance2 = primary_fungible_store::balance(user2_addr, usdc_metadata_obj);

        // Calculate yields
        let yield1 = final_balance1 - DEPOSIT_AMOUNT;
        let yield6 = final_balance2 - DEPOSIT_AMOUNT;

        // Assert that the 6-month yield is greater than the 1-month yield
        assert!(yield6 > yield1, 4);
    }


    #[test(deployer = @vault_addr), expected_failure(abort_code = vault::ESTAKE_IS_LOCKED)]
    fun test_early_withdrawal_fails() {
        let deployer = &account::create_signer_for_test(DEPLOYER);
        setup_system(deployer);
        let user_signer = account::create_signer_for_test(USER_1);
        let user_addr = signer::address_of(&user_signer);
        mock_coins::mint(deployer, user_addr, DEPOSIT_AMOUNT);

        let deployer_addr = signer::address_of(deployer);
        let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
        let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);
        
        vault::deposit<USDC>(&user_signer, usdc_metadata_obj, DEPOSIT_AMOUNT, ONE_MONTH_SECS);

        vault::withdraw<USDC>(&user_signer, usdc_metadata_obj);
    }

    #[test(deployer = @vault_addr), expected_failure(abort_code = vault::ESTAKE_ALREADY_EXISTS)]
    fun test_deposit_to_existing_stake_fails() {
        let deployer = &account::create_signer_for_test(DEPLOYER);
        setup_system(deployer);
        let user_signer = account::create_signer_for_test(USER_1);
        let user_addr = signer::address_of(&user_signer);
        mock_coins::mint(deployer, user_addr, DEPOSIT_AMOUNT);

        let deployer_addr = signer::address_of(deployer);
        let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
        let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);

        vault::deposit<USDC>(&user_signer, usdc_metadata_obj, DEPOSIT_AMOUNT, ONE_MONTH_SECS);
        
        mock_coins::mint(deployer, user_addr, DEPOSIT_AMOUNT);
        vault::deposit<USDC>(&user_signer, usdc_metadata_obj, DEPOSIT_AMOUNT, ONE_MONTH_SECS);
    }
}