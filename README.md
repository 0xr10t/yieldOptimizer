Aptos Yield Optimizer
A decentralized Yield Vault platform on Aptos where users deposit stablecoins via a keyless login to earn optimized yields across top DeFi protocols.

This project creates a seamless DeFi experience on the Aptos blockchain. It allows users to connect with a keyless account (Aptos Connect), deposit stablecoins (USDC, USDT), and automatically earn interest from various yield strategies. The vault is built with a modular architecture in Move, ensuring security and future upgradability.

Quick Links: 🚀 Live Demo • 🎥 Video Demo • 🔗 GitHub Repository • 🐛 Report a Bug

🎯 Why This Project Will Attract Mass Adoption
This platform is engineered to bridge the gap between Web2 and Web3, driving significant user growth through three core advantages:

🚀 Onboarding Millions from Web2: The keyless account system removes the biggest barrier for crypto newcomers. Users can log in with familiar social accounts, making the experience as simple as any traditional web application.

⚡ Blazing-Fast Experience: Powered by Aptos's speed, all interactions—deposits, withdrawals, and yield updates—are nearly instant. This provides a smooth, real-time user experience that is impossible on slower chains.

💰 Unbeatable Returns for All: Offering a great APY of up to 10-20% on stablecoins is a powerful incentive. This will attract significant capital and users from both the Web3 world seeking high yields and the Web2 world looking for better returns than traditional finance can offer.

✨ Key Features
🔑 Keyless Login: Onboard seamlessly with Aptos Connect, linking a wallet to your social login. Your address is used to track all your deposits and earnings.

💰 Stablecoin Deposits: Switch between and deposit major stablecoins like USDC and USDT into high-yield strategies.

📈 Optimized Yield: The strategy.move contract automatically routes funds to the best-performing Aptos DeFi protocols like LiquidSwap and Amnis Finance.

📊 User Dashboard: A comprehensive dashboard to track your total earnings, available balance for withdrawal, days invested, and current APY.

⚡ Instant Withdrawals: Leverage Aptos's sub-second finality to withdraw your funds and profits back to your account at any time.

🔒 Secure & Upgradable: Built with Move's resource constraints for maximum security and designed with a modular architecture for easy future updates.

🏗 Architecture & User Flow
The platform is designed for simplicity and efficiency.

Connection (index.tsx): The user connects via a keyless account. This address becomes their unique identifier across the platform.

Dashboard (dashboard.tsx): After connecting, the user lands on the dashboard. It fetches and displays various yield strategies and their respective APYs from our strategy.move smart contract.

Deposit: The user clicks "Deposit," which navigates to a dedicated page. Here, they can select a stablecoin (USDC/USDT) and the amount they wish to invest. The funds are sent to the vault.move contract.

Withdrawal (withdraw.tsx): From the dashboard, the user can click "Withdraw." This page shows their detailed stats (total earnings, balance, etc.) and allows them to pull their funds and profits from the vault back into their connected keyless account.

📜 Smart Contract Addresses
All contracts are deployed on the Aptos [Mainnet/Testnet]. Please replace placeholders with your actual addresses.

Vault Contract:

0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd
Strategy Contract:

0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd
USDC Token Contract:
0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd
USDT Token Contract:
0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd
Yield Farming:
0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd

🔧 Technology Stack
Category	Technology / Tool
Frontend	React, TypeScript, Aptos TS SDK
Blockchain	Aptos
Smart Contracts	Aptos Move
Authentication	Aptos Connect (Keyless)
Styling	TailwindCSS (or your choice)

Export to Sheets
🚀 Getting Started
Follow these steps to get a local copy of the project up and running.

Prerequisites
Node.js (v18 or higher)

Yarn or npm

An Aptos-compatible wallet extension (e.g., Petra) for testing.

Installation Guide
Clone the repository

Bash

git clone https://github.com/0xr10t/yieldOptimizer.git
cd yieldOptimizer
Install dependencies

Bash

npm install
Set up environment variables
Create a .env file in the root and add the necessary contract addresses. You can copy them from the "Smart Contract Addresses" section above.

Code snippet

VITE_APTOS_NETWORK="devnet"
VITE_VAULT_CONTRACT_ADDRESS="0x...YOUR_VAULT_CONTRACT_ADDRESS"
VITE_STRATEGY_CONTRACT_ADDRESS="0x...YOUR_STRATEGY_CONTRACT_ADDRESS"
VITE_USDC_CONTRACT_ADDRESS="0x...YOUR_MINTED_USDC_CONTRACT_ADDRESS"
VITE_USDT_CONTRACT_ADDRESS="0x...YOUR_MINTED_USDT_CONTRACT_ADDRESS"
Start the development server

Bash

npm run dev
🛣 Roadmap
[✅] Phase 1: Core Vault & Dashboard - Secure vault, stablecoin deposits, and user dashboard are live.

[🔄] Phase 2: High APY Strategies - Implementing advanced yield strategies with a target of 40% APY enhancements.

[📋] Phase 3: Cross-Chain Integration - Enable cross-chain swaps and stablecoin inflows from other chains (e.g., Ethereum) using CCTP.

[🔮] Phase 4: AI Investment Advisor - Integrate ElizaOS to provide users with AI-powered investment advice by scraping and analyzing data from Twitter.

🤝 Contributing
Contributions are welcome! If you have a suggestion that would make this better, please fork the repo and create a pull request.

Fork the Project

Create your Feature Branch (git checkout -b feature/NewStrategy)

Commit your Changes (git commit -m 'Add new high-yield strategy')

Push to the Branch (git push origin feature/NewStrategy)

Open a Pull Request

📞 Contact
Riot - @lucifer_x08,@0xr10t

Project Link: https://github.com/0xr10t/yieldOptimizer