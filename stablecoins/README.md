# Stablecoins (USD & EUR) on Aptos using Move

This package defines two simple managed coins backed by Aptos `aptos_framework::managed_coin`:

- `deployer::stable_usd` (ticker `USDX`, 6 decimals)
- `deployer::stable_eur` (ticker `EURX`, 6 decimals)

Both modules expose `initialize`, `register`, `mint`, and `burn_from_self` entry functions.

## Prerequisites

- Install the Aptos CLI: https://aptos.dev/build/cli
- Initialize your local profile (devnet or testnet):
  ```bash
  aptos init
  ```
  Note your generated account address. Update it in `Move.toml` under `[addresses].deployer` before publishing.

## Project layout

- `Move.toml` – package and dependency configuration
- `sources/stable_usd.move` – USD stablecoin module
- `sources/stable_eur.move` – EUR stablecoin module

## Configure `Move.toml`

Edit `Move.toml` and set your deployer address:
```toml
[addresses]
# Replace with your account address from `aptos init`
deployer = "0x<your_account_address>"
```

## Build

From the `stablecoins/` directory:
```bash
aptos move compile
```

## Publish

- Devnet (default after `aptos init`):
  ```bash
  aptos move publish --named-addresses deployer=0x<your_account_address>
  ```

- Testnet:
  ```bash
  aptos move publish --profile testnet --named-addresses deployer=0x<your_account_address>
  ```

## Initialize modules (run once)

After publishing, initialize each coin (only by the module publisher signer):

```bash
# Initialize USD
aptos move run --function-id 0x<your_account_address>::stable_usd::initialize

# Initialize EUR
aptos move run --function-id 0x<your_account_address>::stable_eur::initialize
```

## Register to receive coins

Any account must register before it can receive these coins:
```bash
# USD register (caller registers self)
aptos move run --function-id 0x<your_account_address>::stable_usd::register

# EUR register
aptos move run --function-id 0x<your_account_address>::stable_eur::register
```

You can also have other accounts run the same commands (with their own profiles) to register.

## Mint and burn

Only the deployer (module publisher) can mint. Replace `<recipient_address>` as needed.

```bash
# Mint 1 USDX (6 decimals -> 1_000_000)
aptos move run \
  --function-id 0x<your_account_address>::stable_usd::mint \
  --args address:<recipient_address> u64:1000000

# Mint 1 EURX
aptos move run \
  --function-id 0x<your_account_address>::stable_eur::mint \
  --args address:<recipient_address> u64:1000000

# Burn 0.5 USDX from caller (requires caller to hold at least that amount)
aptos move run \
  --function-id 0x<your_account_address>::stable_usd::burn_from_self \
  --args u64:500000
```

## Transfer

Once registered and minted, users can transfer using `coin::transfer` via CLI:

```bash
# Example: transfer 0.25 USDX from sender to recipient
aptos move run \
  --function-id 0x1::coin::transfer \
  --type-args 0x<your_account_address>::stable_usd::USD \
  --args address:<recipient_address> u64:250000

# EUR transfer
aptos move run \
  --function-id 0x1::coin::transfer \
  --type-args 0x<your_account_address>::stable_eur::EUR \
  --args address:<recipient_address> u64:250000
```

## Notes

- Decimals are set to `6`. Adjust in modules if you need different precision.
- Token metadata is set in `initialize` via `managed_coin::initialize`.
- To monitor supply on-chain, change the last argument of `initialize` to `true`.
- For production, consider adding access control patterns (e.g., separate mint authority) and off-chain proof-of-reserves.
