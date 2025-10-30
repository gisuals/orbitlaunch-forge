import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Rocket, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useDeployContract } from "@/hooks/useDeployContract";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useChainId, useSwitchChain, usePublicClient } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { decodeEventLog } from "viem";
import { TemplateSelector } from "@/components/TemplateSelector";
import { GasTokenSelector } from "@/components/GasTokenSelector";
import { type ChainTemplate } from "@/config/templates";
import { type TokenInfo } from "@/lib/erc20";

const Deploy = () => {
  const navigate = useNavigate();
  const { registerDeployment, isLoading, isSuccess, txHash, error, isConnected, address } = useDeployContract();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();

  const isCorrectNetwork = chainId === arbitrumSepolia.id;

  const handleSwitchNetwork = () => {
    switchChain({ chainId: arbitrumSepolia.id });
  };

  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();
  const [gasTokenAddress, setGasTokenAddress] = useState<string>("0x0000000000000000000000000000000000000000");
  const [gasTokenInfo, setGasTokenInfo] = useState<TokenInfo | undefined>();

  const [formData, setFormData] = useState({
    chainName: "",
    symbol: "",
    baseNetwork: "Arbitrum Sepolia",
    nativeToken: "",
    description: "",
  });

  // Handle template selection
  const handleTemplateSelect = (template: ChainTemplate) => {
    setSelectedTemplate(template.id);
    setFormData({
      chainName: template.config.chainName,
      symbol: template.config.symbol,
      nativeToken: template.config.nativeToken,
      description: template.config.description,
      baseNetwork: template.config.baseNetwork,
    });
  };

  // Handle gas token change
  const handleGasTokenChange = (address: string, tokenInfo?: TokenInfo) => {
    setGasTokenAddress(address);
    setGasTokenInfo(tokenInfo);
  };

  // Watch for successful deployment
  useEffect(() => {
    if (isSuccess && txHash && publicClient) {
      const fetchDeploymentId = async () => {
        try {
          // Get transaction receipt to extract deploymentId
          const receipt = await publicClient.getTransactionReceipt({ hash: txHash });

          // Find the DeploymentRegistered event
          const deploymentEvent = receipt.logs.find((log: any) => {
            try {
              const decoded = decodeEventLog({
                abi: [{
                  anonymous: false,
                  inputs: [
                    { indexed: true, name: 'deploymentId', type: 'bytes32' },
                    { indexed: true, name: 'deployer', type: 'address' },
                    { indexed: false, name: 'metadataHash', type: 'bytes32' },
                    { indexed: false, name: 'chainId', type: 'uint64' },
                    { indexed: false, name: 'timestamp', type: 'uint64' }
                  ],
                  name: 'DeploymentRegistered',
                  type: 'event'
                }],
                data: log.data,
                topics: log.topics,
              });
              return decoded.eventName === 'DeploymentRegistered';
            } catch {
              return false;
            }
          });

          let deploymentId = '';
          if (deploymentEvent) {
            const decoded: any = decodeEventLog({
              abi: [{
                anonymous: false,
                inputs: [
                  { indexed: true, name: 'deploymentId', type: 'bytes32' },
                  { indexed: true, name: 'deployer', type: 'address' },
                  { indexed: false, name: 'metadataHash', type: 'bytes32' },
                  { indexed: false, name: 'chainId', type: 'uint64' },
                  { indexed: false, name: 'timestamp', type: 'uint64' }
                ],
                name: 'DeploymentRegistered',
                type: 'event'
              }],
              data: deploymentEvent.data,
              topics: deploymentEvent.topics,
            });
            deploymentId = decoded.args.deploymentId;
          }

          const deploymentData = {
            ...formData,
            txHash,
            deploymentId, // Store deployment ID for updates
            chainId: Math.floor(Math.random() * 900000) + 100000,
            rpcUrl: `https://rpc.${formData.chainName.toLowerCase().replace(/\s+/g, '-')}.arbitrum.io`,
            explorerUrl: `https://explorer.${formData.chainName.toLowerCase().replace(/\s+/g, '-')}.arbitrum.io`,
            deployedAt: new Date().toISOString(),
            deployer: address,
            templateType: selectedTemplate,
            gasTokenAddress,
            gasTokenSymbol: gasTokenInfo?.symbol,
            gasTokenName: gasTokenInfo?.name,
            status: 'registered', // Chain is registered, not yet deployed
          };

          sessionStorage.setItem("deploymentData", JSON.stringify(deploymentData));
          if (deploymentId) {
            sessionStorage.setItem("lastDeploymentId", deploymentId);
          }

          toast.success("Chain registered successfully! Configuration saved on-chain.");

          setTimeout(() => {
            navigate("/success");
          }, 1000);
        } catch (err) {
          console.error("Error fetching deployment ID:", err);
          // Still save without deploymentId
          const deploymentData = {
            ...formData,
            txHash,
            chainId: Math.floor(Math.random() * 900000) + 100000,
            rpcUrl: `https://rpc.${formData.chainName.toLowerCase().replace(/\s+/g, '-')}.arbitrum.io`,
            explorerUrl: `https://explorer.${formData.chainName.toLowerCase().replace(/\s+/g, '-')}.arbitrum.io`,
            deployedAt: new Date().toISOString(),
            deployer: address,
            templateType: selectedTemplate,
            gasTokenAddress,
            gasTokenSymbol: gasTokenInfo?.symbol,
            gasTokenName: gasTokenInfo?.name,
            status: 'registered',
          };
          sessionStorage.setItem("deploymentData", JSON.stringify(deploymentData));
          toast.success("Chain registered successfully!");
          setTimeout(() => navigate("/success"), 1000);
        }
      };

      fetchDeploymentId();
    }
  }, [isSuccess, txHash, navigate, formData, address, selectedTemplate, gasTokenAddress, gasTokenInfo, publicClient]);

  // Watch for errors
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Deployment failed");
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.chainName || !formData.symbol || !formData.baseNetwork || !formData.nativeToken) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isCorrectNetwork) {
      toast.error("Please switch to Arbitrum Sepolia network");
      return;
    }

    try {
      const chainId = Math.floor(Math.random() * 900000) + 100000;

      // Include gas token info in metadata
      const metadata = {
        chainName: formData.chainName,
        symbol: formData.symbol,
        nativeToken: formData.nativeToken,
        description: formData.description,
        baseNetwork: formData.baseNetwork,
        rpcUrl: `https://rpc.${formData.chainName.toLowerCase().replace(/\s+/g, '-')}.arbitrum.io`,
        templateType: selectedTemplate || 'custom',
        gasTokenAddress,
        gasTokenSymbol: gasTokenInfo?.symbol || 'ETH',
        gasTokenName: gasTokenInfo?.name || 'Ethereum',
      };

      await registerDeployment(metadata, chainId);

      toast.success("Transaction submitted! Check your wallet...");
    } catch (err: any) {
      console.error("Deployment error:", err);
      toast.error(err.message || "Failed to deploy chain");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            OrbitLaunch
          </h1>
          <div className="flex items-center gap-3">
            <appkit-button />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Deploy Your Orbit Chain</h2>
          <p className="text-muted-foreground">
            Choose a template or customize your own Arbitrum Orbit L3 chain
          </p>
        </div>

        {!isConnected && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to deploy a chain. Click the "Connect Wallet" button above.
            </AlertDescription>
          </Alert>
        )}

        {isConnected && !isCorrectNetwork && (
          <Alert className="mb-6 bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              Wrong network! Please switch to Arbitrum Sepolia testnet.{" "}
              <Button
                variant="link"
                className="h-auto p-0 text-destructive underline"
                onClick={handleSwitchNetwork}
              >
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isConnected && isCorrectNetwork && (
          <Alert className="mb-6 bg-primary/10 border-primary/20">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              Connected: {address?.substring(0, 6)}...{address?.substring(38)} on Arbitrum Sepolia - Ready to deploy!
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="template" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Use Template
            </TabsTrigger>
            <TabsTrigger value="custom">
              Custom Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-6">
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelect={handleTemplateSelect}
            />

            {selectedTemplate && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Review & Customize</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chainName">
                        Chain Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="chainName"
                        placeholder="My Orbit Chain"
                        value={formData.chainName}
                        onChange={(e) =>
                          setFormData({ ...formData, chainName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="symbol">
                        Symbol <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="symbol"
                        placeholder="MOC"
                        value={formData.symbol}
                        onChange={(e) =>
                          setFormData({ ...formData, symbol: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nativeToken">
                      Native Token Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nativeToken"
                      placeholder="My Chain Token"
                      value={formData.nativeToken}
                      onChange={(e) =>
                        setFormData({ ...formData, nativeToken: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your chain's purpose..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="border-t border-border/50 pt-6">
                    <h4 className="text-sm font-semibold mb-4">Advanced Options</h4>
                    <GasTokenSelector
                      value={gasTokenAddress}
                      onChange={handleGasTokenChange}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="xl"
                    className="w-full gap-2"
                    disabled={!isConnected || !isCorrectNetwork || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-5 w-5" />
                        {!isConnected ? "Connect Wallet First" : !isCorrectNetwork ? "Switch to Arbitrum Sepolia" : "Deploy Chain"}
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chainName">
                      Chain Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="chainName"
                      placeholder="My Custom Chain"
                      value={formData.chainName}
                      onChange={(e) =>
                        setFormData({ ...formData, chainName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symbol">
                      Symbol <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="symbol"
                      placeholder="MCC"
                      value={formData.symbol}
                      onChange={(e) =>
                        setFormData({ ...formData, symbol: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseNetwork">
                      Base Network <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.baseNetwork}
                      onValueChange={(value) =>
                        setFormData({ ...formData, baseNetwork: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arbitrum Sepolia">Arbitrum Sepolia</SelectItem>
                        <SelectItem value="Arbitrum One">Arbitrum One</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nativeToken">
                      Native Token Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nativeToken"
                      placeholder="Custom Token"
                      value={formData.nativeToken}
                      onChange={(e) =>
                        setFormData({ ...formData, nativeToken: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your chain's purpose and features..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <div className="border-t border-border/50 pt-6">
                  <h4 className="text-sm font-semibold mb-4">Advanced Options</h4>
                  <GasTokenSelector
                    value={gasTokenAddress}
                    onChange={handleGasTokenChange}
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="w-full gap-2"
                  disabled={!isConnected || !isCorrectNetwork || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-5 w-5" />
                      {!isConnected ? "Connect Wallet First" : !isCorrectNetwork ? "Switch to Arbitrum Sepolia" : "Deploy Chain"}
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Deploy;
