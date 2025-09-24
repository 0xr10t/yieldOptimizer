module vault_addr::stable_usd {
    use aptos_framework::managed_coin;

    /// Phantom type for the USD stablecoin
    struct USD has drop, store {}

    const NAME: vector<u8> = b"USD Stablecoin";
    const SYMBOL: vector<u8> = b"USDX"; // change if you want a different ticker
    const DECIMALS: u8 = 6; // typical for USD stablecoins

    /// Initialize the USD coin. Must be called once by the deployer (publisher) to set metadata
    /// and create the mint capability bound to the module publisher.
    public entry fun initialize(admin: &signer) {
        managed_coin::initialize<USD>(admin, NAME, SYMBOL, DECIMALS, false);
        // Optionally auto-register the admin so it can hold balances if needed
        managed_coin::register<USD>(admin);
    }

    /// Any user should register before receiving this coin
    public entry fun register(user: &signer) {
        managed_coin::register<USD>(user);
    }

    /// Mint new USD to a recipient. Only the module publisher/admin can mint.
    public entry fun mint(admin: &signer, recipient: address, amount: u64) {
        managed_coin::mint<USD>(admin, recipient, amount);
    }

}
