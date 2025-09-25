// import { createContext, useContext, useState} from "react";

// const WalletContext = createContext({
//   address: null,
//   connectWallet: async () => {} 
// });

// export const WalletProvider = ({ children }) => {
//   const [address, setAddress] = useState(null);

//   const connectWallet = async () => {
//     if (!window.ethereum) {
//       alert("Install MetaMask");
//       return;
//     }

//     try {
//     const accounts = await window.ethereum.request({ method: 'eth_accounts' });

//     if (accounts.length > 0) {
//       setAddress(accounts[0]);
//       console.log("Wallet already connected:", accounts[0]);
//     } else {
//       const newAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//       setAddress(newAccounts[0]);
//     }
//   } catch (err) {
//     console.error('Wallet connection error:', err);
//     if (err.code === -32002) {
//       alert("Please open MetaMask and approve the request manually.");
//     }
//   }
//   };

//   return (
//     <WalletContext.Provider value={{ address, connectWallet }}>
//       {children}
//     </WalletContext.Provider>
//   );
// };

// export const useWallet = () => useContext(WalletContext);