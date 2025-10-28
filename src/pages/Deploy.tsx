import { useState } from "react";
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
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Rocket } from "lucide-react";
import { toast } from "sonner";

const Deploy = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    chainName: "",
    symbol: "",
    baseNetwork: "",
    nativeToken: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.chainName || !formData.symbol || !formData.baseNetwork || !formData.nativeToken) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Generate mock deployment data
    const deploymentData = {
      ...formData,
      chainId: Math.floor(Math.random() * 900000) + 100000,
      rpcUrl: `https://rpc.${formData.chainName.toLowerCase().replace(/\s+/g, '-')}.arbitrum.io`,
      deployedAt: new Date().toISOString(),
    };

    // Store in session storage
    sessionStorage.setItem("deploymentData", JSON.stringify(deploymentData));
    
    toast.success("Chain deployment initiated!");
    
    // Navigate to success page
    setTimeout(() => {
      navigate("/success");
    }, 500);
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
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Deploy Your Chain</h2>
          <p className="text-muted-foreground">
            Configure your Arbitrum Orbit chain parameters
          </p>
        </div>

        <Card className="p-6 shadow-card border-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="chainName">Chain Name *</Label>
              <Input
                id="chainName"
                placeholder="e.g., MyOrbit Chain"
                value={formData.chainName}
                onChange={(e) =>
                  setFormData({ ...formData, chainName: e.target.value })
                }
                required
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                placeholder="e.g., MOC"
                value={formData.symbol}
                onChange={(e) =>
                  setFormData({ ...formData, symbol: e.target.value.toUpperCase() })
                }
                required
                maxLength={10}
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseNetwork">Base Network *</Label>
              <Select
                value={formData.baseNetwork}
                onValueChange={(value) =>
                  setFormData({ ...formData, baseNetwork: value })
                }
                required
              >
                <SelectTrigger id="baseNetwork" className="rounded-2xl">
                  <SelectValue placeholder="Select base network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arbitrum-one">Arbitrum One</SelectItem>
                  <SelectItem value="arbitrum-nova">Arbitrum Nova</SelectItem>
                  <SelectItem value="arbitrum-goerli">Arbitrum Goerli</SelectItem>
                  <SelectItem value="arbitrum-sepolia">Arbitrum Sepolia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nativeToken">Native Token *</Label>
              <Input
                id="nativeToken"
                placeholder="e.g., ETH"
                value={formData.nativeToken}
                onChange={(e) =>
                  setFormData({ ...formData, nativeToken: e.target.value })
                }
                required
                className="rounded-2xl"
              />
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
                className="rounded-2xl min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full gap-2"
            >
              <Rocket className="h-5 w-5" />
              Deploy Chain
            </Button>
          </form>
        </Card>

        <p className="text-sm text-muted-foreground text-center mt-6">
          * Required fields
        </p>
      </main>
    </div>
  );
};

export default Deploy;
