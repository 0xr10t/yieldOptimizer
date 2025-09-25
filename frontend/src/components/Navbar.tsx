import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHelpBox } from "../components/HelpBox.js";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useKeylessAuth } from "@/hooks/useKeylessAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User, Wallet } from "lucide-react";
//import {useWallet} from "../context/WalletContext.jsx";

const Navbar = () => {

  const [currentPath, setCurrentPath] = useState("");
  const { openHelp } = useHelpBox();
  const { connected } = useWallet();
  const { user, isLoggedIn, loginWithGoogle, logout, loading } = useKeylessAuth();
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

      <div className="flex gap-4 md:gap-8 text-white text-xs md:text-base">
        <button
          onClick={() => navigate("/dashboard")}
          className={linkClasses("/dashboard")}>
          Dashboard
        </button>
        <button
          onClick={() => navigate("/deposit")}
          className={linkClasses("/deposit")}>
          Deposit
        </button>
        <button
          onClick={() => navigate("/withdraw")}
          className={linkClasses("/withdraw")}>
          Withdraw
        </button>
        <button
          onClick={openHelp}
          className="hover:text-purple-300 transition focus:outline-none">
          Help
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Keyless Auth Section */}
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white text-sm">
              <User className="w-4 h-4" />
              <span>{user?.name || user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={loginWithGoogle}
            disabled={loading}
            className="text-white border-white/20 hover:bg-white/10"
          >
            <User className="w-4 h-4 mr-2" />
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
        )}
        
        {/* Traditional Wallet Selector */}
        <div className="border-l border-white/20 pl-4">
          <WalletSelector />
        </div>
      </div>
    </div>
  );
};

export default Navbar;