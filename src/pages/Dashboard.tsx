import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowLeft,
  Activity,
  Layers,
  Zap,
  ExternalLink,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useChainStats, useRecentBlocks } from "@/hooks/useChainStats";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deploymentData, setDeploymentData] = useState<any>(null);

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
  const { stats, isLoading: statsLoading, error: statsError } = useChainStats(rpcUrl);
  const { blocks, averageBlockTime, isLoading: blocksLoading } = useRecentBlocks(rpcUrl, 5);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

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
        {/* Chain Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">{deploymentData.chainName}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Activity className="h-3 w-3" />
                  {stats?.isResponding ? "Live" : "Offline"}
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

        {statsError && (
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
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">RPC URL</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono max-w-[200px] truncate">
                    {deploymentData.rpcUrl}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => copyToClipboard(deploymentData.rpcUrl, "RPC URL")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Base Network</span>
                <span className="text-sm font-medium">{deploymentData.baseNetwork}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Native Token</span>
                <span className="text-sm font-medium">{deploymentData.nativeToken}</span>
              </div>

              {deploymentData.gasTokenAddress && deploymentData.gasTokenAddress !== '0x0000000000000000000000000000000000000000' && (
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Custom Gas Token</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-xs">
                      {deploymentData.gasTokenAddress.slice(0, 6)}...{deploymentData.gasTokenAddress.slice(-4)}
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
      </main>
    </div>
  );
};

export default Dashboard;
