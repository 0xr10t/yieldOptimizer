// #[test_only]
// module vault_addr::strategy_tests {
//     use std::signer;
//     use aptos_framework::fungible_asset::{Metadata};
//     use aptos_framework::account;
//     use aptos_framework::object;
//     use aptos_framework::primary_fungible_store;
//     use vault_addr::vault;
//     use vault_addr::strategy;
//     use vault_addr::lending_protocol::{Self, ReceiptToken, RewardToken};
//     use vault_addr::mock_coins::{Self, USDC};

//     const DEPLOYER: address = @vault_addr;
//     const USER: address = @0x200;
//     const TREASURY_AMOUNT: u64 = 1_000_000 * 1_000_000;
//     const DEPOSIT_AMOUNT: u64 = 100 * 1_000_000;
//     const ONE_MONTH_SECS: u64 = 2592000;

//     fun setup_system(deployer: &signer) {
//         account::create_account_for_test(USER);
//         mock_coins::initialize_usdc(deployer);
//         lending_protocol::initialize_mock_protocol(deployer);

//         let deployer_addr = signer::address_of(deployer);
//         let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
//         let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);

//         vault::initialize<USDC>(deployer, usdc_metadata_obj);

//         let vault_resource_addr = account::create_resource_address(&deployer_addr, b"vault_account");
//         mock_coins::mint(deployer, vault_resource_addr, TREASURY_AMOUNT);
//     }

//     #[test(deployer = @vault_addr)]
//     fun test_strategy_deposit_and_withdraw() {
//         let deployer = &account::create_signer_for_test(DEPLOYER);
//         setup_system(deployer);
//         let user_signer = account::create_signer_for_test(USER);
//         let user_addr = signer::address_of(&user_signer);
//         mock_coins::mint(deployer, user_addr, DEPOSIT_AMOUNT);
//         let deployer_addr = signer::address_of(deployer);
//         let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
//         let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);
//         vault::deposit<USDC>(&user_signer, usdc_metadata_obj, DEPOSIT_AMOUNT, ONE_MONTH_SECS);
//         assert!(primary_fungible_store::balance(user_addr, usdc_metadata_obj) == 0, 1);
//         let strategy_obj = vault::get_strategy_object<USDC>();
//         let receipt_balance = strategy::get_receipt_token_balance<USDC, ReceiptToken, RewardToken>(strategy_obj);
//         assert!(receipt_balance == DEPOSIT_AMOUNT, 2);
//         vault::unlock_stake<USDC>(&user_signer);
//         vault::withdraw<USDC>(&user_signer, usdc_metadata_obj);
//         let final_receipt_balance = strategy::get_receipt_token_balance<USDC, ReceiptToken, RewardToken>(strategy_obj);
//         assert!(final_receipt_balance == 0, 3);
//         let final_user_balance = primary_fungible_store::balance(user_addr, usdc_metadata_obj);
//         assert!(final_user_balance > DEPOSIT_AMOUNT, 4);
//     }

//     #[test(deployer = @vault_addr)]
//     fun test_harvest_rewards() {
//         let deployer = &account::create_signer_for_test(DEPLOYER);
//         setup_system(deployer);
//         let user_signer = account::create_signer_for_test(USER);
//         let user_addr = signer::address_of(&user_signer);
//         mock_coins::mint(deployer, user_addr, DEPOSIT_AMOUNT);
//         let deployer_addr = signer::address_of(deployer);
//         let usdc_metadata_addr = object::create_object_address(&deployer_addr, b"MockUSDC");
//         let usdc_metadata_obj = object::address_to_object<Metadata>(usdc_metadata_addr);
//         let vault_resource_addr = account::create_resource_address(&deployer_addr, b"vault_account");
//         let reward_token_metadata_addr = object::create_object_address(&deployer_addr, b"RewardToken");
//         let reward_token_metadata_obj = object::address_to_object<Metadata>(reward_token_metadata_addr);
//         vault::deposit<USDC>(&user_signer, usdc_metadata_obj, DEPOSIT_AMOUNT, ONE_MONTH_SECS);
//         let initial_treasury_balance = primary_fungible_store::balance(vault_resource_addr, reward_token_metadata_obj);
//         vault::harvest<USDC>(&user_signer);
//         let final_treasury_balance = primary_fungible_store::balance(vault_resource_addr, reward_token_metadata_obj);
//         assert!(final_treasury_balance > initial_treasury_balance, 1);
//         assert!(final_treasury_balance == initial_treasury_balance + (10 * 1_000_000), 2);
//     }
// }

#[test_only]
module vault_addr::strategy_tests {
    // Basic tests for the strategy module can be added here
}