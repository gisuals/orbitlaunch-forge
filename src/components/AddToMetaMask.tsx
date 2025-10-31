import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { addNetworkToMetaMask, isMetaMaskInstalled, type NetworkConfig } from "@/lib/metamask";

interface AddToMetaMaskProps {
  chainId: number;
  chainName: string;
  nativeTokenName: string;
  nativeTokenSymbol: string;
  rpcUrl: string;
  explorerUrl?: string;
  variant?: "default" | "outline" | "hero";
  size?: "default" | "sm" | "lg" | "xl";
  className?: string;
}

export function AddToMetaMask({
  chainId,
  chainName,
  nativeTokenName,
  nativeTokenSymbol,
  rpcUrl,
  explorerUrl,
  variant = "default",
  size = "default",
  className = "",
}: AddToMetaMaskProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccessfully, setAddedSuccessfully] = useState(false);

  const handleAddToMetaMask = async () => {
    // Check if MetaMask is installed
    if (!isMetaMaskInstalled()) {
      toast.error("MetaMask is not installed", {
        description: "Please install MetaMask browser extension to add this network.",
        action: {
          label: "Install MetaMask",
          onClick: () => window.open("https://metamask.io/download/", "_blank"),
        },
      });
      return;
    }

    // Check if RPC URL is valid
    if (!rpcUrl || !rpcUrl.startsWith('http')) {
      toast.error("Invalid RPC URL", {
        description: "The RPC URL for this chain is not configured yet. Please deploy your chain first and update the RPC URL.",
      });
      return;
    }

    setIsAdding(true);

    const networkConfig: NetworkConfig = {
      chainId,
      chainName,
      nativeCurrency: {
        name: nativeTokenName,
        symbol: nativeTokenSymbol,
        decimals: 18,
      },
      rpcUrls: [rpcUrl],
      ...(explorerUrl && { blockExplorerUrls: [explorerUrl] }),
    };

    const result = await addNetworkToMetaMask(networkConfig);

    setIsAdding(false);

    if (result.success) {
      setAddedSuccessfully(true);
      toast.success("Network added to MetaMask!", {
        description: `${chainName} has been added to your MetaMask. You can now switch to it and start interacting with the chain.`,
      });

      // Reset success state after 3 seconds
      setTimeout(() => setAddedSuccessfully(false), 3000);
    } else {
      if (result.error === "User rejected the request") {
        toast.info("Request cancelled", {
          description: "You cancelled the network addition request.",
        });
      } else {
        toast.error("Failed to add network", {
          description: result.error || "An error occurred while adding the network to MetaMask.",
        });
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
      onClick={handleAddToMetaMask}
      disabled={isAdding || addedSuccessfully}
    >
      {isAdding ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Adding to MetaMask...
        </>
      ) : addedSuccessfully ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Added Successfully!
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Add to MetaMask
        </>
      )}
    </Button>
  );
}

interface AddToMetaMaskCardProps extends AddToMetaMaskProps {
  showInstructions?: boolean;
}

export function AddToMetaMaskCard({
  showInstructions = true,
  ...props
}: AddToMetaMaskCardProps) {
  const hasValidRpc = props.rpcUrl && props.rpcUrl.startsWith('http') && !props.rpcUrl.includes('.arbitrum.io');

  return (
    <div className="space-y-4">
      {!hasValidRpc ? (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-500 mb-1">
              RPC URL Not Configured
            </p>
            <p className="text-xs text-muted-foreground">
              This chain uses a placeholder RPC URL. You'll need to deploy your actual Arbitrum Orbit chain
              and update the RPC URL before you can add it to MetaMask and interact with it.
            </p>
          </div>
        </div>
      ) : (
        <>
          {showInstructions && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Add this chain to MetaMask to start interacting with it. This will:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Add {props.chainName} to your network list</li>
                <li>Configure the RPC endpoint automatically</li>
                <li>Set up the native token ({props.nativeTokenSymbol})</li>
                {props.explorerUrl && <li>Link the block explorer</li>}
              </ul>
            </div>
          )}

          <AddToMetaMask {...props} variant="hero" size="lg" className="w-full" />

          {showInstructions && (
            <p className="text-xs text-muted-foreground text-center">
              After adding, you can send transactions, check balances, and interact with smart contracts on this chain.
            </p>
          )}
        </>
      )}
    </div>
  );
}
