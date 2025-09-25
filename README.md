# Aptos Yield Optimizer

A **decentralized Yield Vault platform** on Aptos where users deposit stablecoins via a **keyless login** to earn optimized yields across top DeFi protocols.

This project creates a **seamless DeFi experience** on the Aptos blockchain. It allows users to connect with a **keyless account (Aptos Connect)**, deposit stablecoins (USDC, USDT), and automatically earn interest from various yield strategies. The vault is built with a **modular architecture in Move**, ensuring security and future upgradability.

---

## 🔗 Quick Links
- 🔗 (https://github.com/0xr10t/yieldOptimizer)


---

## 🎯 Why This Project Will Attract Mass Adoption

This platform bridges **Web2 and Web3** through three core advantages:

- 🚀 **Onboarding Millions from Web2**  
  Keyless account system removes the biggest barrier. Users can log in with **social accounts**.

- ⚡ **Blazing-Fast Experience**  
  Powered by **Aptos’s speed**, deposits, withdrawals, and updates are **near-instant**.

- 💰 **Unbeatable Returns**  
  Up to **40% APY on stablecoins**—a huge incentive for both Web2 & Web3 users.

---

## ✨ Key Features

- 🔑 **Keyless Login**: Onboard via Aptos Connect (social login linked to wallet).
- 💰 **Stablecoin Deposits**: Deposit **USDC / USDT**.
- 📈 **Optimized Yield**: `strategy.move` auto-routes to **LiquidSwap** and **Amnis Finance**.
- 📊 **User Dashboard**: Track deposits, earnings, APY, and days invested.
- ⚡ **Instant Withdrawals**: Sub-second finality via Aptos.
- 🔒 **Secure & Upgradable**: Built with Move’s **resource constraints**.

---

## 🏗 Architecture & User Flow

1. **Connection (`index.tsx`)**  
   User connects via **keyless account** (Aptos Connect).  
   Their wallet address = **unique identifier**.

2. **Dashboard (`dashboard.tsx`)**  
   Displays yield strategies & APYs fetched from `strategy.move`.

3. **Deposit**  
   User selects stablecoin & amount → funds sent to `vault.move`.

4. **Withdrawal (`withdraw.tsx`)**  
   Shows detailed stats & allows instant withdrawal.

---

## 📜 Smart Contract Addresses

> Replace placeholders with deployed addresses.

- **Vault Contract:** `0x...YOUR_VAULT_CONTRACT_ADDRESS`  
- **Strategy Contract:** `0x...YOUR_STRATEGY_CONTRACT_ADDRESS`  
- **USDC Token Contract:** `0x...YOUR_MINTED_USDC_CONTRACT_ADDRESS`  
- **USDT Token Contract:** `0x...YOUR_MINTED_USDT_CONTRACT_ADDRESS`  

---

## 🔧 Technology Stack

| Category       | Technology / Tool                  |
|----------------|------------------------------------|
| **Frontend**   | React, TypeScript, Aptos TS SDK    |
| **Blockchain** | Aptos                              |
| **Contracts**  | Move (Vault + Strategy)            |
| **Auth**       | Aptos Connect (Keyless)            |
| **Styling**    | TailwindCSS                        |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm / yarn
- Aptos-compatible wallet (e.g., Petra) for testing

### Installation

```bash
git clone https://github.com/0xr10t/yieldOptimizer.git
cd yieldOptimizer
npm install
Environment Variables
Create .env in root:

env
Copy code
VITE_APTOS_NETWORK="devnet"
VITE_VAULT_CONTRACT_ADDRESS="0x...YOUR_VAULT_CONTRACT_ADDRESS"
VITE_STRATEGY_CONTRACT_ADDRESS="0x...YOUR_STRATEGY_CONTRACT_ADDRESS"
VITE_USDC_CONTRACT_ADDRESS="0x...YOUR_MINTED_USDC_CONTRACT_ADDRESS"
VITE_USDT_CONTRACT_ADDRESS="0x...YOUR_MINTED_USDT_CONTRACT_ADDRESS"
Start Dev Server
bash
Copy code
npm run dev
🛣 Roadmap
✅ Phase 1: Core Vault & Dashboard (live)

🔄 Phase 2: High APY Strategies (target: 40% APY)

📋 Phase 3: Cross-Chain Integration (via CCTP)

🔮 Phase 4: AI Investment Advisor (ElizaOS + Twitter data)

🤝 Contributing
Fork the repo

Create a branch:

bash
Copy code
git checkout -b feature/NewStrategy
Commit changes:

bash
Copy code
git commit -m 'Add new high-yield strategy'
Push & open a PR.

📞 Contact
Riot - @lucifer_x08

Project: GitHub Repo