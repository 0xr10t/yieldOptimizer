import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHelpBox } from "../components/HelpBox.js";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
//import {useWallet} from "../context/WalletContext.jsx";

const Navbar = () => {

  const [currentPath, setCurrentPath] = useState("");
  const { openHelp } = useHelpBox();
  const { connected } = useWallet();
  const navigate = useNavigate();
  //const{address,connectWallet}=useWallet();
  
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  // When wallet is connected, redirect to dashboard
  useEffect(() => {
    if (connected) {
      navigate("/dashboard");
    }
  }, [connected, navigate]);

  const linkClasses = (path) =>
    `hover:text-purple-300 transition ${currentPath === path ? "underline underline-offset-4 text-purple-300" : ""
    }`;

  return (
    <div className="flex justify-between items-center px-6 md:px-16 py-4 absolute top-0 left-0 w-full z-20">
      <div className="text-white text-xl font-semibold tracking-widest">LOGO</div>

      <div className="hidden md:flex gap-8 text-white text-sm md:text-base">
        <button
          onClick={openHelp}
          className="hover:text-purple-300 transition focus:outline-none">
          Help
        </button>
      </div>

      <div className="flex items-center gap-4">
        <WalletSelector />
      </div>
    </div>
  );
};

export default Navbar;