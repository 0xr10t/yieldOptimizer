#[test_only]
module vault_addr::vault_tests {
    use std::signer;
    use aptos_framework::fungible_asset::{Metadata};
    use aptos_framework::account;
    // REMOVED: No longer need timestamp
    // use aptos_framework::timestamp;
    use aptos_framework::object;
    use aptos_framework::primary_fungible_store;

    use vault_addr::vault;
    use vault_addr::mock_coins::{Self, USDC};

    const DEPLOYER: address = @vault_addr;
    const USER: address = @0x200;

    const DEPOSIT_AMOUNT: u64 = 100 * 1_000_000;
    // REMOVED: Duration is no longer needed.
    // const ONE_MONTH: u64 = 2592000;

    fun setup_system(deployer: &signer) {
        // No need to initialize time anymore.
        account::create_account_for_test(USER);
        mock_coins::initialize_usdc(deployer);

        let deployer_addr = signer::address_of(deployer);
        let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
        let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);

        vault::initialize<USDC>(deployer, usdc_metadata_obj);
    }

    #[test(deployer = @vault_addr)]
    fun test_full_deposit_and_withdraw_cycle() {
        let deployer = &account::create_signer_for_test(DEPLOYER);
        setup_system(deployer);
        let user_signer = account::create_signer_for_test(USER);
        let user_addr = signer::address_of(&user_signer);
        mock_coins::mint(deployer, user_addr, DEPOSIT_AMOUNT);

        let deployer_addr = signer::address_of(deployer);
        let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
        let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);

        assert!(primary_fungible_store::balance(user_addr, usdc_metadata_obj) == DEPOSIT_AMOUNT, 1);
        
        // FIXED: Deposit call no longer needs duration.
        vault::deposit<USDC>(&user_signer, usdc_metadata_obj, DEPOSIT_AMOUNT);

        assert!(primary_fungible_store::balance(user_addr, usdc_metadata_obj) == 0, 2);

        // FIXED: Instead of fast-forwarding time, we now call the unlock function.
        vault::unlock_stake<USDC>(&user_signer);

        vault::withdraw<USDC>(&user_signer);
        let final_balance = primary_fungible_store::balance(user_addr, usdc_metadata_obj);
        assert!(final_balance > DEPOSIT_AMOUNT, 3);
    }

    #[test(deployer = @vault_addr), expected_failure(abort_code = vault::ESTAKE_IS_LOCKED)]
    fun test_early_withdrawal_fails() {
        let deployer = &account::create_signer_for_test(DEPLOYER);
        setup_system(deployer);
        let user_signer = account::create_signer_for_test(USER);
        let user_addr = signer::address_of(&user_signer);
        mock_coins::mint(deployer, user_addr, DEPOSIT_AMOUNT);

        let deployer_addr = signer::address_of(deployer);
        let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
        let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);
        
        // FIXED: Deposit call no longer needs duration.
        vault::deposit<USDC>(&user_signer, usdc_metadata_obj, DEPOSIT_AMOUNT);

        // FIXED: No need to fast-forward time. We just try to withdraw while it's still locked.
        vault::withdraw<USDC>(&user_signer);
    }

    #[test(deployer = @vault_addr), expected_failure(abort_code = vault::ESTAKE_ALREADY_EXISTS)]
    fun test_deposit_to_existing_stake_fails() {
        let deployer = &account::create_signer_for_test(DEPLOYER);
        setup_system(deployer);
        let user_signer = account::create_signer_for_test(USER);
        let user_addr = signer::address_of(&user_signer);
        mock_coins::mint(deployer, user_addr, DEPOSIT_AMOUNT);

        let deployer_addr = signer::address_of(deployer);
        let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
        let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);

        // First deposit
        vault::deposit<USDC>(&user_signer, usdc_metadata_obj, DEPOSIT_AMOUNT);

        // Second (failed) deposit
        mock_coins::mint(deployer, user_addr, DEPOSIT_AMOUNT);
        vault::deposit<USDC>(&user_signer, usdc_metadata_obj, DEPOSIT_AMOUNT);
    }
}