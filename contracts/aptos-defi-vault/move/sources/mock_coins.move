module vault_addr::mock_coins {
    use std::signer;
    use std::string;
    use aptos_framework::fungible_asset::{Self, MintRef, BurnRef, TransferRef};
    use aptos_framework::object;
    use aptos_framework::primary_fungible_store;
    use std::option;

    struct USDC has key, store, drop {}

    struct UsdcRefs has key {
        mint_ref: MintRef,
        burn_ref: BurnRef,
        transfer_ref: TransferRef,
    }

    public entry fun initialize_usdc(creator: &signer) {
        let constructor_ref = &object::create_named_object(creator, b"MockUSDC");
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            string::utf8(b"Mock USDC"),
            string::utf8(b"USDC"),
            6,
            string::utf8(b""),
            string::utf8(b""),
        );
        move_to(creator, UsdcRefs {
            mint_ref: fungible_asset::generate_mint_ref(constructor_ref),
            burn_ref: fungible_asset::generate_burn_ref(constructor_ref),
            transfer_ref: fungible_asset::generate_transfer_ref(constructor_ref),
        });
    }

    public entry fun mint(creator: &signer, recipient: address, amount: u64) acquires UsdcRefs {
        let creator_addr = signer::address_of(creator);
        let mint_ref = &borrow_global<UsdcRefs>(creator_addr).mint_ref;
        let asset = fungible_asset::mint(mint_ref, amount);
        primary_fungible_store::deposit(recipient, asset);
    }
}