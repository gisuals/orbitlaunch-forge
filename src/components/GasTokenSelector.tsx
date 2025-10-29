import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { validateERC20Token, type TokenInfo, isNativeToken } from "@/lib/erc20";
import { useConfig } from "wagmi";

interface GasTokenSelectorProps {
  value: string;
  onChange: (address: string, tokenInfo?: TokenInfo) => void;
}

export function GasTokenSelector({ value, onChange }: GasTokenSelectorProps) {
  const config = useConfig();
  const [useCustomToken, setUseCustomToken] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate token when address changes
  useEffect(() => {
    if (!useCustomToken || !tokenAddress || tokenAddress.length < 42) {
      setTokenInfo(null);
      setValidationError(null);
      return;
    }

    const validateToken = async () => {
      setIsValidating(true);
      setValidationError(null);

      try {
        const info = await validateERC20Token(tokenAddress, config);

        if (info.isValid) {
          setTokenInfo(info);
          onChange(tokenAddress, info);
        } else {
          setValidationError("Invalid ERC-20 token address or not supported");
          setTokenInfo(null);
        }
      } catch (error) {
        setValidationError("Failed to validate token. Please check the address.");
        setTokenInfo(null);
      } finally {
        setIsValidating(false);
      }
    };

    const debounce = setTimeout(validateToken, 500);
    return () => clearTimeout(debounce);
  }, [tokenAddress, useCustomToken, config]);

  // Handle custom token checkbox
  const handleCustomTokenToggle = (checked: boolean) => {
    setUseCustomToken(checked);
    if (!checked) {
      setTokenAddress("");
      setTokenInfo(null);
      setValidationError(null);
      onChange("0x0000000000000000000000000000000000000000"); // Default to ETH
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="customGasToken"
          checked={useCustomToken}
          onCheckedChange={handleCustomTokenToggle}
        />
        <Label
          htmlFor="customGasToken"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Use Custom Gas Token (Advanced)
        </Label>
      </div>

      {!useCustomToken && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Your chain will use ETH as the native gas token. This is the recommended option for most use cases.
          </AlertDescription>
        </Alert>
      )}

      {useCustomToken && (
        <div className="space-y-4 border border-border/50 rounded-lg p-4 bg-muted/20">
          <div className="space-y-2">
            <Label htmlFor="gasTokenAddress">
              ERC-20 Token Contract Address
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="relative">
              <Input
                id="gasTokenAddress"
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className={`pr-10 ${validationError ? 'border-destructive' : tokenInfo ? 'border-primary' : ''}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValidating && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!isValidating && tokenInfo && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
                {!isValidating && validationError && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the address of an existing ERC-20 token on Arbitrum Sepolia to use as gas token
            </p>
          </div>

          {tokenInfo && (
            <Alert className="bg-primary/10 border-primary/20">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-primary">Token Validated Successfully</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Name:</span>
                      <Badge variant="secondary">{tokenInfo.name}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Symbol:</span>
                      <Badge variant="secondary">{tokenInfo.symbol}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Decimals:</span>
                      <Badge variant="secondary">{tokenInfo.decimals}</Badge>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs space-y-1">
              <p className="font-medium">Important Considerations:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Ensure the token exists on the parent chain (Arbitrum Sepolia)</li>
                <li>Users will need this token to pay for gas on your chain</li>
                <li>This is an advanced feature - use ETH for simplicity</li>
                <li>Test thoroughly before mainnet deployment</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
