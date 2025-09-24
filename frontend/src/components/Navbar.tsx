import React, { useEffect, useState } from "react";
import { useHelpBox } from "../components/HelpBox.js";
//import {useWallet} from "../context/WalletContext.jsx";

const Navbar = () => {

  const [currentPath, setCurrentPath] = useState("");
  const { openHelp } = useHelpBox();
  //const{address,connectWallet}=useWallet();
  
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

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
      {/* <button onClick={connectWallet} disabled={!!address} className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition">
    {address ? `Connected` : "Connect Wallet"}
  </button> */}
      </div>
    </div>
  );
};

export default Navbar;