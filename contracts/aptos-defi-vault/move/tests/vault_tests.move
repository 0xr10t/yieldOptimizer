#[test_only]
module vault_addr::vault_tests {
    use std::signer;
    use aptos_framework::fungible_asset::{Metadata};
    use aptos_framework::account;
    use aptos_framework::object;
    use aptos_framework::primary_fungible_store;
    use aptos_framework::timestamp;
    use vault_addr::vault;
    use vault_addr::mock_coins::{Self, USDC};
    use vault_addr::lending_protocol;

    const DEPLOYER: address = @vault_addr;
    const USER_1: address = @0x200;
    const DEPOSIT_AMOUNT: u64 = 100 * 1_000_000;
    const ONE_MONTH_SECS: u64 = 2592000;

    fun setup_system(deployer: &signer) {
        account::create_account_for_test(USER_1);
        mock_coins::initialize_usdc(deployer);
        lending_protocol::initialize_mock_protocol(deployer);

        let deployer_addr = signer::address_of(deployer);
        let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
        let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);

        vault::initialize<USDC>(deployer, usdc_metadata_obj);
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

        vault::deposit<USDC>(&user_signer, usdc_metadata_obj, DEPOSIT_AMOUNT, ONE_MONTH_SECS);
        assert!(primary_fungible_store::balance(user_addr, usdc_metadata_obj) == 0, 2);

        timestamp::fast_forward_seconds(ONE_MONTH_SECS + 1);
        vault::withdraw<USDC>(&user_signer);

        let final_balance = primary_fungible_store::balance(user_addr, usdc_metadata_obj);
        assert!(final_balance > DEPOSIT_AMOUNT, 3);
    }
}