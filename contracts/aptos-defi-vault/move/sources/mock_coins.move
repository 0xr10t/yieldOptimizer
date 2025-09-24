module vault_addr::mock_coins {
    use std::signer;
    // FIXED: Cleaned up the import to remove the unused 'String' alias.
    use std::string;
    use aptos_framework::coin::{Self, BurnCapability, FreezeCapability, MintCapability};

    /// A struct to represent our Mock USDC coin type.
    struct USDC has drop {}

    /// A struct to represent our Mock USDT coin type.
    struct USDT has drop {}

    /// A resource to hold the capabilities for managing a specific coin.
    struct CoinCapabilities<phantom CoinType> has key {
        mint_cap: MintCapability<CoinType>,
        burn_cap: BurnCapability<CoinType>,
        freeze_cap: FreezeCapability<CoinType>,
    }

    /// Initializes the USDC coin, creating its metadata and capabilities.
    public entry fun initialize_usdc(deployer: &signer) {
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<USDC>(
            deployer,
            string::utf8(b"Mock USDC"),
            string::utf8(b"USDC"),
            6, // Standard decimals for USDC
            true, // Monitor supply
        );

        move_to(deployer, CoinCapabilities<USDC> {
            mint_cap,
            burn_cap,
            freeze_cap,
        });
    }

    /// Initializes the USDT coin, creating its metadata and capabilities.
    public entry fun initialize_usdt(deployer: &signer) {
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<USDT>(
            deployer,
            string::utf8(b"Mock USDT"),
            string::utf8(b"USDT"),
            6, // Standard decimals for USDT
            true, // Monitor supply
        );

        move_to(deployer, CoinCapabilities<USDT> {
            mint_cap,
            burn_cap,
            freeze_cap,
        });
    }

    /// Allows any user to register to receive a specific mock coin.
    public entry fun register<CoinType>(user: &signer) {
        coin::register<CoinType>(user);
    }

    /// Mints a specified `amount` of a mock coin to a `recipient`.
    public entry fun mint<CoinType>(deployer: &signer, recipient: address, amount: u64) acquires CoinCapabilities {
        let deployer_addr = signer::address_of(deployer);
        let capabilities = borrow_global<CoinCapabilities<CoinType>>(deployer_addr);
        
        let new_coins = coin::mint<CoinType>(amount, &capabilities.mint_cap);

        coin::deposit(recipient, new_coins);
    }
}

