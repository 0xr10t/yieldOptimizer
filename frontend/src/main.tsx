import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

createRoot(document.getElementById("root")!).render(
  <AptosWalletAdapterProvider
    autoConnect={true}
    dappConfig={{
      network: Network.TESTNET,
    }}
    onError={(error) => {
      console.error("Aptos wallet adapter error:", error);
    }}
  >
    <App />
  </AptosWalletAdapterProvider>
);
