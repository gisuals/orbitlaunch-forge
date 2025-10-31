import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowLeft,
  Activity,
  Layers,
  Zap,
  ExternalLink,
  Copy,
  Download,
  AlertCircle,
  Loader2,
  Edit,
  Check,
  X
} from "lucide-react";
import { useChainStats, useRecentBlocks } from "@/hooks/useChainStats";
import { useUpdateDeployment } from "@/hooks/useUpdateDeployment";
import { validateRpcUrl } from "@/lib/rpcValidator";
import { toast } from "sonner";
import { AddToMetaMask } from "@/components/AddToMetaMask";
import { ChainInteractionGuide } from "@/components/ChainInteractionGuide";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deploymentData, setDeploymentData] = useState<any>(null);
  const [isEditingRpc, setIsEditingRpc] = useState(false);
  const [newRpcUrl, setNewRpcUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  const { updateDeployment, isUploading, isLoading, isSuccess: updateSuccess } = useUpdateDeployment();

  useEffect(() => {
    // Try to get deployment data from sessionStorage first
    const storedData = sessionStorage.getItem("deploymentData");
    if (storedData) {
      setDeploymentData(JSON.parse(storedData));
    } else {
      // Fallback to URL params if available
      const chainName = searchParams.get("chainName");
      if (chainName) {
        setDeploymentData({
          chainName,
          symbol: searchParams.get("symbol") || "",
          rpcUrl: searchParams.get("rpcUrl") || "",
          chainId: searchParams.get("chainId") || "",
          deployer: searchParams.get("deployer") || "",
          txHash: searchParams.get("txHash") || "",
        });
      }
    }
  }, [searchParams]);

  const rpcUrl = deploymentData?.rpcUrl || "";
  // Check if it's a real RPC URL (not a placeholder)
  const isPlaceholderUrl = rpcUrl.includes('rpc.') && rpcUrl.includes('.arbitrum.io');
  const hasValidRpcUrl = rpcUrl && rpcUrl.length > 0 && rpcUrl.startsWith('http') && !isPlaceholderUrl;

  // Only fetch stats if we have a valid (non-placeholder) RPC URL
  const { stats, isLoading: statsLoading, error: statsError } = useChainStats(
    hasValidRpcUrl ? rpcUrl : '',
    hasValidRpcUrl ? 10000 : 0 // Disable polling if no RPC
  );
  const { blocks, averageBlockTime, isLoading: blocksLoading } = useRecentBlocks(
    hasValidRpcUrl ? rpcUrl : '',
    5,
    hasValidRpcUrl ? 15000 : 0 // Disable polling if no RPC
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleUpdateRpcUrl = async () => {
    if (!newRpcUrl.trim()) {
      setValidationError("Please enter an RPC URL");
      return;
    }

    // Validate RPC URL
    setIsValidating(true);
    setValidationError("");

    const validation = await validateRpcUrl(newRpcUrl);

    setIsValidating(false);

    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid RPC URL");
      toast.error(`RPC validation failed: ${validation.error}`);
      return;
    }

    // Show validation success
    toast.success(`RPC URL validated! Chain ID: ${validation.chainId}, Block: ${validation.blockNumber}`);

    // Update metadata with new RPC URL
    const updatedMetadata = {
      ...deploymentData,
      rpcUrl: newRpcUrl,
      explorerUrl: deploymentData.explorerUrl,
    };

    try {
      // Need deploymentId from contract - for now store locally
      // In production, fetch deploymentId from contract events
      const deploymentId = deploymentData.deploymentId || sessionStorage.getItem("lastDeploymentId");

      if (!deploymentId) {
        toast.error("Deployment ID not found. Please re-register your chain.");
        return;
      }

      await updateDeployment(deploymentId, updatedMetadata);

      // Update local storage
      setDeploymentData(updatedMetadata);
      sessionStorage.setItem("deploymentData", JSON.stringify(updatedMetadata));

      setIsEditingRpc(false);
      setNewRpcUrl("");
      toast.success("RPC URL updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update RPC URL");
    }
  };

  // Watch for successful update
  useEffect(() => {
    if (updateSuccess) {
      toast.success("RPC URL updated on-chain!");
      // Refresh page data
      window.location.reload();
    }
  }, [updateSuccess]);

  const exportConfig = () => {
    const config = {
      chainName: deploymentData.chainName,
      chainId: deploymentData.chainId,
      symbol: deploymentData.symbol,
      rpcUrl: deploymentData.rpcUrl,
      explorer: `https://sepolia.arbiscan.io/address/${deploymentData.deployer}`,
      deploymentDate: deploymentData.deployedAt,
      deployer: deploymentData.deployer,
      transactionHash: deploymentData.txHash,
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deploymentData.chainName.replace(/\s+/g, '-').toLowerCase()}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Configuration exported successfully!");
  };

  if (!deploymentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No deployment data found</h2>
          <p className="text-muted-foreground mb-4">
            Please deploy a chain first to view the dashboard.
          </p>
          <Button onClick={() => navigate("/deploy")}>
            Deploy a Chain
          </Button>
        </Card>
      </div>
    );
  }

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
            Chain Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <appkit-button />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Registration Notice */}
        {!hasValidRpcUrl && (
          <Card className="p-6 mb-6 border-amber-500/50 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-500 mb-2">Chain Registered - Deployment Pending</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your chain configuration has been successfully registered on-chain with a placeholder RPC URL.
                  The actual L3 chain deployment requires additional setup through Arbitrum's Orbit deployment tools.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Why is the RPC URL showing but not working?</p>
                  <p className="text-muted-foreground mb-3">
                    The RPC URL displayed below (<code className="text-xs bg-background/50 px-1 py-0.5 rounded">{rpcUrl}</code>) is a placeholder
                    for your future chain. It won't respond until you deploy the actual Arbitrum Orbit chain infrastructure.
                  </p>
                  <p className="font-medium">Next Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Use <a href="https://docs.arbitrum.io/launch-orbit-chain/orbit-quickstart" target="_blank" rel="noopener noreferrer" className="text-primary underline">Arbitrum Orbit CLI</a> to deploy your L3 chain</li>
                    <li>Configure the chain using your registered parameters and templates</li>
                    <li>Once deployed, your actual RPC URL will match this placeholder format</li>
                  </ol>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* RPC URL Update Card */}
        {!hasValidRpcUrl && (
          <Card className="p-6 mb-6 border-primary/50 bg-primary/5">
            <div className="flex items-start gap-3">
              <Edit className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-primary mb-2">
                  {isEditingRpc ? "Update RPC URL" : "Have you deployed your chain?"}
                </h3>

                {!isEditingRpc ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      If you've already deployed your Arbitrum Orbit L3 chain using the Orbit SDK or deployment tools,
                      you can update your RPC URL here to connect it to OrbitLaunch Dashboard.
                    </p>
                    <Button
                      variant="default"
                      onClick={() => setIsEditingRpc(true)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Update RPC URL
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rpcUrl">RPC URL</Label>
                      <Input
                        id="rpcUrl"
                        placeholder="https://your-chain-rpc.example.com"
                        value={newRpcUrl}
                        onChange={(e) => {
                          setNewRpcUrl(e.target.value);
                          setValidationError("");
                        }}
                        disabled={isValidating || isUploading || isLoading}
                      />
                      {validationError && (
                        <p className="text-sm text-destructive">{validationError}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Enter your deployed chain's RPC endpoint. We'll validate it before updating.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleUpdateRpcUrl}
                        disabled={isValidating || isUploading || isLoading || !newRpcUrl.trim()}
                        className="gap-2"
                      >
                        {isValidating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Validating...
                          </>
                        ) : isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading to IPFS...
                          </>
                        ) : isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating on-chain...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Update RPC URL
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingRpc(false);
                          setNewRpcUrl("");
                          setValidationError("");
                        }}
                        disabled={isValidating || isUploading || isLoading}
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Chain Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">{deploymentData.chainName}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Activity className="h-3 w-3" />
                  {hasValidRpcUrl ? (stats?.isResponding ? "Live" : "Offline") : "Registered"}
                </Badge>
                <Badge variant="outline">{deploymentData.symbol}</Badge>
                {deploymentData.templateType && (
                  <Badge variant="outline" className="capitalize">
                    {deploymentData.templateType} Chain
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {hasValidRpcUrl && (
                <AddToMetaMask
                  chainId={deploymentData.chainId}
                  chainName={deploymentData.chainName}
                  nativeTokenName={deploymentData.nativeToken}
                  nativeTokenSymbol={deploymentData.symbol}
                  rpcUrl={deploymentData.rpcUrl}
                  explorerUrl={deploymentData.explorerUrl}
                  variant="outline"
                  size="sm"
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={exportConfig}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export Config
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://sepolia.arbiscan.io/tx/${deploymentData.txHash}`, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View on Explorer
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Chain ID</span>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{deploymentData.chainId || 'N/A'}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Block Number</span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{stats?.blockNumber.toLocaleString() || '0'}</div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Gas Price</span>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{stats?.gasPrice || 'N/A'}</div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Block Time</span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            {blocksLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{averageBlockTime ? `${averageBlockTime}s` : 'N/A'}</div>
            )}
          </Card>
        </div>

        {statsError && hasValidRpcUrl && (
          <Card className="p-6 mb-8 border-destructive/50 bg-destructive/5">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">{statsError}</p>
            </div>
          </Card>
        )}

        {/* Chain Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Chain Configuration</h3>
            <div className="space-y-3">
              {/* RPC URL - Show both valid and placeholder */}
              <div className="py-2 border-b border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">RPC URL</span>
                  {hasValidRpcUrl && stats?.isResponding && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      Live
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono max-w-[85%] truncate">
                    {deploymentData.rpcUrl || 'No RPC URL configured'}
                  </span>
                  {deploymentData.rpcUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => copyToClipboard(deploymentData.rpcUrl, "RPC URL")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {!hasValidRpcUrl && deploymentData.rpcUrl && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Update with your real endpoint after deploying your chain.
                  </p>
                )}
              </div>

              {/* Network & Chain Info */}
              <div className="py-2 border-b border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Network</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Parent Chain:</span>
                    <span className="text-sm font-medium">{deploymentData.baseNetwork}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Chain Type:</span>
                    <span className="text-sm font-medium">Arbitrum Orbit L3</span>
                  </div>
                  {deploymentData.chainId && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Chain ID:</span>
                      <span className="text-sm font-mono">{deploymentData.chainId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Token Information */}
              <div className="py-2 border-b border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Tokens</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Native Token:</span>
                    <span className="text-sm font-medium">{deploymentData.nativeToken} ({deploymentData.symbol})</span>
                  </div>
                  {deploymentData.gasTokenSymbol && deploymentData.gasTokenSymbol !== 'ETH' && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Gas Token:</span>
                      <span className="text-sm font-medium">{deploymentData.gasTokenName} ({deploymentData.gasTokenSymbol})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Explorer URL (if available) */}
              {deploymentData.explorerUrl && (
                <div className="py-2 border-b border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Block Explorer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono max-w-[85%] truncate">
                      {deploymentData.explorerUrl}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => copyToClipboard(deploymentData.explorerUrl, "Explorer URL")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  {!hasValidRpcUrl && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Explorer URL for your deployed chain.
                    </p>
                  )}
                </div>
              )}

              {/* Gas Token Address (if using custom gas token) */}
              {deploymentData.gasTokenAddress && deploymentData.gasTokenAddress !== '0x0000000000000000000000000000000000000000' && (
                <div className="py-2 border-b border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Gas Token Address</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-xs">
                      {deploymentData.gasTokenAddress}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => copyToClipboard(deploymentData.gasTokenAddress, "Gas Token Address")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ERC-20 token address on {deploymentData.baseNetwork}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Deployment Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Deployer</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-xs">
                    {deploymentData.deployer?.slice(0, 6)}...{deploymentData.deployer?.slice(-4)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => copyToClipboard(deploymentData.deployer, "Deployer Address")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-xs">
                    {deploymentData.txHash?.slice(0, 6)}...{deploymentData.txHash?.slice(-4)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => copyToClipboard(deploymentData.txHash, "Transaction Hash")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Deployed At</span>
                <span className="text-sm font-medium">
                  {deploymentData.deployedAt
                    ? new Date(deploymentData.deployedAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Blocks */}
        {blocks.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Blocks</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Block</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Transactions</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((block) => (
                    <tr key={block.number} className="border-b border-border/30">
                      <td className="py-3 text-sm font-mono">{block.number}</td>
                      <td className="py-3 text-sm">{block.transactions}</td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(block.timestamp * 1000).toLocaleTimeString()}
                      </td>
                      <td className="py-3 text-sm font-mono text-xs">
                        {block.hash.slice(0, 10)}...{block.hash.slice(-8)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Chain Interaction Guide */}
        <div className="mt-8">
          <ChainInteractionGuide
            chainId={deploymentData.chainId}
            chainName={deploymentData.chainName}
            rpcUrl={deploymentData.rpcUrl}
            explorerUrl={deploymentData.explorerUrl}
            nativeTokenSymbol={deploymentData.symbol}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
