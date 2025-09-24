import React from "react";

const HelpBox = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-purple/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div
        className="bg-[#11143f]/30 border border-white/40 backdrop-blur-xxxl p-12 rounded-xl max-w-lg w-1200 text-white shadow-2xl transition opacity-0 animate-slideInBottom delay-[400ms]"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[48px] font-semibold">How It Works</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-4xl"
          >
            &times;
          </button>
        </div>

        <div className="text-[24px] leading-relaxed space-y-3">
          <p>Welcome to your AI trading assistant!</p>
          <p>Here's what you can do:</p>
          <ul className="list-disc text-[20px] list-inside text-white/80">
            <li>Create and deploy AI agents</li>
            <li>Choose data sources like Twitter, Telegram</li>
            <li>Set your trading pair and strategy</li>
            <li>Monitor trades in the trade history tab</li>
          </ul>
          <p>Connect your wallet to get started.🚀</p>
        </div>
      </div>
    </div>
  );
};

export default HelpBox;