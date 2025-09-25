import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Shield, Key, ArrowRight } from "lucide-react";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WalletModal = ({ open, onOpenChange }: WalletModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const walletOptions = [
    {
      name: "Petra Wallet",
      icon: Wallet,
      description: "Official Aptos wallet with keyless features",
      popular: true,
    },
    {
      name: "Martian Wallet",
      icon: Shield,
      description: "Secure multi-chain wallet",
      popular: false,
    },
    {
      name: "Keyless Account",
      icon: Key,
      description: "Sign in with your existing accounts",
      popular: false,
    },
  ];

  const handleConnect = async (walletName: string) => {
    setIsConnecting(true);
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConnecting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Connect Your Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="w-full h-16 p-4 border-border hover:border-primary hover:shadow-glow transition-all duration-300 group"
              onClick={() => handleConnect(wallet.name)}
              disabled={isConnecting}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <wallet.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{wallet.name}</span>
                      {wallet.popular && (
                        <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{wallet.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            New to Web3? No problem! Use our keyless account feature to get started instantly.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;