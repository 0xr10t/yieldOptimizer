module vault_addr::mock_coins {
    use std::signer;
    use std::string;
    use aptos_framework::fungible_asset::{Self, MintRef, BurnRef, TransferRef};
    use aptos_framework::object;
    use aptos_framework::primary_fungible_store;
    use std::option;

    /// The struct representing our mock USDC.
    /// It must have the `key` ability to be a valid `CoinType` for the FA standard.
    struct USDC has key, store, drop {}

    /// This resource holds the capability to mint new USDC.
    /// It's stored under the deployer's account, giving them exclusive minting rights.
    struct UsdcRefs has key {
        mint_ref: MintRef,
        burn_ref: BurnRef,
        transfer_ref: TransferRef,
    }

    /// Initializes the USDC metadata object and stores its capabilities for the deployer.
    /// This function should be called once by the contract deployer to set up the mock coin.
    public entry fun initialize_usdc(creator: &signer) {
        // Create a named, non-deletable object to hold the metadata for our USDC.
        // The name `b"MockUSDC"` ensures its address is deterministic.
        let constructor_ref = &object::create_named_object(creator, b"MockUSDC");

        // This is the correct modern function to create the FA metadata.
        // It enables the primary store, so users don't need to manually register to receive USDC.
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(), // No max supply for this mock coin
            string::utf8(b"Mock USDC"),
            string::utf8(b"USDC"),
            6, // 6 decimals, just like real USDC
            string::utf8(b""), // icon uri
            string::utf8(b""), // project uri
        );

        // Generate the capabilities (Refs) and store them securely in a resource
        // under the creator's account.
        move_to(creator, UsdcRefs {
            mint_ref: fungible_asset::generate_mint_ref(constructor_ref),
            burn_ref: fungible_asset::generate_burn_ref(constructor_ref),
            transfer_ref: fungible_asset::generate_transfer_ref(constructor_ref),
        });
    }

    /// Mints a specified amount of USDC to a recipient.
    /// Only the account holding the `UsdcRefs` resource (the creator) can call this.
    public entry fun mint(creator: &signer, recipient: address, amount: u64) acquires UsdcRefs {
        let creator_addr = signer::address_of(creator);
        // To mint, we must first borrow the MintRef capability from storage.
        let mint_ref = &borrow_global<UsdcRefs>(creator_addr).mint_ref;
        // Mint the new asset. This returns a temporary `FungibleAsset` struct.
        let asset = fungible_asset::mint(mint_ref, amount);
        // Deposit the asset into the recipient's primary store. This automatically handles
        // creating a store for them if they don't have one.
        primary_fungible_store::deposit(recipient, asset);
    }
}

