import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AddToMetaMaskCard } from "@/components/AddToMetaMask";
import { ChainInteractionGuide } from "@/components/ChainInteractionGuide";

interface DeploymentData {
  chainName: string;
  symbol: string;
  baseNetwork: string;
  nativeToken: string;
  description: string;
  chainId: number;
  rpcUrl: string;
  deployedAt: string;
  txHash?: string;
  deployer?: string;
}

const Success = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DeploymentData | null>(null);

  useEffect(() => {
    const deploymentData = sessionStorage.getItem("deploymentData");
    if (!deploymentData) {
      navigate("/");
      return;
    }
    setData(JSON.parse(deploymentData));
  }, [navigate]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (!data) {
    return null;
  }

  const networkNames: Record<string, string> = {
    "arbitrum-one": "Arbitrum One",
    "arbitrum-nova": "Arbitrum Nova",
    "arbitrum-goerli": "Arbitrum Goerli",
    "arbitrum-sepolia": "Arbitrum Sepolia",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            OrbitLaunch
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-4 shadow-glow">
            <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Deployment Successful!</h2>
          <p className="text-muted-foreground">
            Your Arbitrum Orbit chain has been deployed
          </p>
        </div>

        <Card className="p-6 shadow-card border-border/50 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Chain Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start p-4 rounded-2xl bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Chain Name</p>
                  <p className="font-medium">{data.chainName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(data.chainName, "Chain name")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between items-start p-4 rounded-2xl bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Symbol</p>
                  <p className="font-medium">{data.symbol}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(data.symbol, "Symbol")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between items-start p-4 rounded-2xl bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Base Network</p>
                  <p className="font-medium">{networkNames[data.baseNetwork]}</p>
                </div>
              </div>

              <div className="flex justify-between items-start p-4 rounded-2xl bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Chain ID</p>
                  <p className="font-medium font-mono">{data.chainId}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(data.chainId.toString(), "Chain ID")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between items-start p-4 rounded-2xl bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">RPC URL</p>
                  <p className="font-medium font-mono text-sm break-all">{data.rpcUrl}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(data.rpcUrl, "RPC URL")}
                  className="ml-2 flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between items-start p-4 rounded-2xl bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Native Token</p>
                  <p className="font-medium">{data.nativeToken}</p>
                </div>
              </div>

              {data.description && (
                <div className="p-4 rounded-2xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{data.description}</p>
                </div>
              )}

              {data.txHash && (
                <div className="flex justify-between items-start p-4 rounded-2xl bg-gradient-primary/10 border border-primary/20">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-primary mb-1">Transaction Hash</p>
                    <p className="font-medium font-mono text-xs break-all text-primary">{data.txHash}</p>
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(data.txHash, "Transaction hash")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`https://sepolia.arbiscan.io/tx/${data.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {data.deployer && (
                <div className="flex justify-between items-start p-4 rounded-2xl bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Deployer Address</p>
                    <p className="font-medium font-mono text-sm">{data.deployer}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(data.deployer, "Deployer address")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">
              Deployed at: {new Date(data.deployedAt).toLocaleString()}
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={() => navigate("/dashboard")}
                >
                  View Dashboard
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 gap-2"
                  asChild
                >
                  <a
                    href="https://sepolia.arbiscan.io/address/0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Contract
                  </a>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  sessionStorage.removeItem("deploymentData");
                  navigate("/");
                }}
                className="rounded-2xl"
              >
                Deploy Another Chain
              </Button>
            </div>
          </div>
        </Card>

        {/* Add to MetaMask Section */}
        <Card className="p-6 shadow-card border-border/50 mt-6">
          <h3 className="text-lg font-semibold mb-4">Add Network to MetaMask</h3>
          <AddToMetaMaskCard
            chainId={data.chainId}
            chainName={data.chainName}
            nativeTokenName={data.nativeToken}
            nativeTokenSymbol={data.symbol}
            rpcUrl={data.rpcUrl}
            explorerUrl={data.explorerUrl}
            showInstructions={true}
          />
        </Card>

        {/* Interaction Guide */}
        <div className="mt-6">
          <ChainInteractionGuide
            chainId={data.chainId}
            chainName={data.chainName}
            rpcUrl={data.rpcUrl}
            explorerUrl={data.explorerUrl}
            nativeTokenSymbol={data.symbol}
          />
        </div>
      </main>
    </div>
  );
};

export default Success;
