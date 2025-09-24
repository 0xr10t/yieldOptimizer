#[test_only]
module vault_addr::vault_tests {
    use std::signer;
    use aptos_framework::fungible_asset::{Metadata};
    use aptos_framework::account;
    use aptos_framework::object;
    use aptos_framework::primary_fungible_store;

    use vault_addr::vault;
    use vault_addr::mock_coins::{Self, USDC};

    const DEPLOYER: address = @vault_addr;
    const USER: address = @0x200;
    const TREASURY_AMOUNT: u64 = 1_000_000 * 1_000_000; // 1M USDC

    const DEPOSIT_AMOUNT: u64 = 100 * 1_000_000;

    fun setup_system(deployer: &signer) {
        account::create_account_for_test(USER);
        mock_coins::initialize_usdc(deployer);

        let deployer_addr = signer::address_of(deployer);
        let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
        let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);

        vault::initialize<USDC>(deployer, usdc_metadata_obj);

        // FIXED: Fund the vault's resource account to act as a treasury for paying yield.
        let vault_resource_addr = account::create_resource_address(&deployer_addr, b"vault_account");
        mock_coins::mint(deployer, vault_resource_addr, TREASURY_AMOUNT);
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
        
        vault::deposit<USDC>(&user_signer, usdc_metadata_obj, DEPOSIT_AMOUNT);

        assert!(primary_fungible_store::balance(user_addr, usdc_metadata_obj) == 0, 2);

        vault::unlock_stake<USDC>(&user_signer);

        // FIXED: The withdraw function now also requires the metadata object.
        vault::withdraw<USDC>(&user_signer, usdc_metadata_obj);

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
        
        vault::deposit<USDC>(&user_signer, usdc_metadata_obj, DEPOSIT_AMOUNT);
        
        // FIXED: The withdraw function now also requires the metadata object.
        vault::withdraw<USDC>(&user_signer, usdc_metadata_obj);
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