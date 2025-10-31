import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Terminal,
  Wallet,
  Code2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface ChainInteractionGuideProps {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  explorerUrl?: string;
  nativeTokenSymbol: string;
}

export function ChainInteractionGuide({
  chainId,
  chainName,
  rpcUrl,
  explorerUrl,
  nativeTokenSymbol,
}: ChainInteractionGuideProps) {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyCommand = (command: string, label: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const hasValidRpc = rpcUrl && rpcUrl.startsWith('http') && !rpcUrl.includes('.arbitrum.io');

  // Cast commands
  const castCommands = {
    chainId: `cast chain-id --rpc-url ${rpcUrl}`,
    blockNumber: `cast block-number --rpc-url ${rpcUrl}`,
    gasPrice: `cast gas-price --rpc-url ${rpcUrl}`,
    balance: `cast balance <ADDRESS> --rpc-url ${rpcUrl}`,
    sendEth: `cast send <TO_ADDRESS> --value 0.1ether --rpc-url ${rpcUrl} --private-key <YOUR_PRIVATE_KEY>`,
    call: `cast call <CONTRACT_ADDRESS> "balanceOf(address)(uint256)" <ADDRESS> --rpc-url ${rpcUrl}`,
    deployContract: `forge create src/MyContract.sol:MyContract --rpc-url ${rpcUrl} --private-key <YOUR_PRIVATE_KEY>`,
    getBlock: `cast block latest --rpc-url ${rpcUrl}`,
    getTx: `cast tx <TX_HASH> --rpc-url ${rpcUrl}`,
    getReceipt: `cast receipt <TX_HASH> --rpc-url ${rpcUrl}`,
  };

  // Web3.js example
  const web3Example = `import Web3 from 'web3';

const web3 = new Web3('${rpcUrl}');

// Get block number
const blockNumber = await web3.eth.getBlockNumber();
console.log('Current block:', blockNumber);

// Get balance
const balance = await web3.eth.getBalance('<ADDRESS>');
console.log('Balance:', web3.utils.fromWei(balance, 'ether'), '${nativeTokenSymbol}');

// Send transaction
const tx = await web3.eth.sendTransaction({
  from: '<YOUR_ADDRESS>',
  to: '<TO_ADDRESS>',
  value: web3.utils.toWei('0.1', 'ether'),
  gas: 21000,
});
console.log('Transaction:', tx.transactionHash);`;

  // Ethers.js example
  const ethersExample = `import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('${rpcUrl}');

// Get block number
const blockNumber = await provider.getBlockNumber();
console.log('Current block:', blockNumber);

// Get balance
const balance = await provider.getBalance('<ADDRESS>');
console.log('Balance:', ethers.formatEther(balance), '${nativeTokenSymbol}');

// Send transaction (with wallet)
const wallet = new ethers.Wallet('<PRIVATE_KEY>', provider);
const tx = await wallet.sendTransaction({
  to: '<TO_ADDRESS>',
  value: ethers.parseEther('0.1'),
});
await tx.wait();
console.log('Transaction:', tx.hash);`;

  // Viem example
  const viemExample = `import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const publicClient = createPublicClient({
  transport: http('${rpcUrl}'),
});

// Get block number
const blockNumber = await publicClient.getBlockNumber();
console.log('Current block:', blockNumber);

// Get balance
const balance = await publicClient.getBalance({ 
  address: '<ADDRESS>' 
});
console.log('Balance:', balance, '${nativeTokenSymbol}');

// Send transaction (with wallet)
const account = privateKeyToAccount('<PRIVATE_KEY>');
const walletClient = createWalletClient({
  account,
  transport: http('${rpcUrl}'),
});

const hash = await walletClient.sendTransaction({
  to: '<TO_ADDRESS>',
  value: parseEther('0.1'),
});
console.log('Transaction:', hash);`;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Interact with Your Chain
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasValidRpc
            ? "Use these tools and commands to interact with your deployed chain"
            : "Deploy your chain and update the RPC URL to start interacting with it"}
        </p>
      </div>

      {!hasValidRpc ? (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
          <p className="text-sm text-amber-500">
            ⚠️ Configure a valid RPC URL to see interaction examples
          </p>
        </div>
      ) : (
        <Tabs defaultValue="metamask" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metamask" className="gap-2">
              <Wallet className="h-4 w-4" />
              MetaMask
            </TabsTrigger>
            <TabsTrigger value="cast" className="gap-2">
              <Terminal className="h-4 w-4" />
              Cast/Forge
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Code2 className="h-4 w-4" />
              Code
            </TabsTrigger>
          </TabsList>

          {/* MetaMask Tab */}
          <TabsContent value="metamask" className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Using MetaMask</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  After adding the network to MetaMask, you can:
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Switch to {chainName}</p>
                    <p className="text-muted-foreground">
                      Open MetaMask → Click network dropdown → Select "{chainName}"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">View Your Balance</p>
                    <p className="text-muted-foreground">
                      Your {nativeTokenSymbol} balance will be displayed in MetaMask
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Send Transactions</p>
                    <p className="text-muted-foreground">
                      Use MetaMask to send {nativeTokenSymbol} to any address
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Interact with dApps</p>
                    <p className="text-muted-foreground">
                      Connect MetaMask to dApps deployed on your chain
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Add Tokens</p>
                    <p className="text-muted-foreground">
                      Import custom ERC-20 tokens deployed on your chain
                    </p>
                  </div>
                </div>
              </div>

              {explorerUrl && (
                <div className="mt-4 p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-1">Block Explorer</p>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {explorerUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Cast/Forge Tab */}
          <TabsContent value="cast" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Using Foundry (cast/forge)</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Foundry is a fast toolkit for Ethereum development. Install it with:
              </p>
              <CommandBlock
                command="curl -L https://foundry.paradigm.xyz | bash && foundryup"
                label="Install Foundry"
                onCopy={copyCommand}
                isCopied={copiedCommand === "Install Foundry"}
              />
            </div>

            <div className="space-y-3">
              <div>
                <Badge variant="outline" className="mb-2">Chain Info</Badge>
                <div className="space-y-2">
                  <CommandBlock
                    command={castCommands.chainId}
                    label="Get Chain ID"
                    onCopy={copyCommand}
                    isCopied={copiedCommand === "Get Chain ID"}
                    description="Verify the chain ID matches your configuration"
                  />
                  <CommandBlock
                    command={castCommands.blockNumber}
                    label="Get Block Number"
                    onCopy={copyCommand}
                    isCopied={copiedCommand === "Get Block Number"}
                    description="Get the current block height"
                  />
                  <CommandBlock
                    command={castCommands.gasPrice}
                    label="Get Gas Price"
                    onCopy={copyCommand}
                    isCopied={copiedCommand === "Get Gas Price"}
                    description="Check current gas price in Wei"
                  />
                </div>
              </div>

              <div>
                <Badge variant="outline" className="mb-2">Account Operations</Badge>
                <div className="space-y-2">
                  <CommandBlock
                    command={castCommands.balance}
                    label="Check Balance"
                    onCopy={copyCommand}
                    isCopied={copiedCommand === "Check Balance"}
                    description="Get balance of any address"
                  />
                  <CommandBlock
                    command={castCommands.sendEth}
                    label="Send Transaction"
                    onCopy={copyCommand}
                    isCopied={copiedCommand === "Send Transaction"}
                    description="Send ETH to an address"
                  />
                </div>
              </div>

              <div>
                <Badge variant="outline" className="mb-2">Smart Contracts</Badge>
                <div className="space-y-2">
                  <CommandBlock
                    command={castCommands.deployContract}
                    label="Deploy Contract"
                    onCopy={copyCommand}
                    isCopied={copiedCommand === "Deploy Contract"}
                    description="Deploy a smart contract using Forge"
                  />
                  <CommandBlock
                    command={castCommands.call}
                    label="Call Contract"
                    onCopy={copyCommand}
                    isCopied={copiedCommand === "Call Contract"}
                    description="Call a read-only contract function"
                  />
                </div>
              </div>

              <div>
                <Badge variant="outline" className="mb-2">Block & Transaction Data</Badge>
                <div className="space-y-2">
                  <CommandBlock
                    command={castCommands.getBlock}
                    label="Get Block"
                    onCopy={copyCommand}
                    isCopied={copiedCommand === "Get Block"}
                    description="Get details of a specific block"
                  />
                  <CommandBlock
                    command={castCommands.getTx}
                    label="Get Transaction"
                    onCopy={copyCommand}
                    isCopied={copiedCommand === "Get Transaction"}
                    description="Get transaction details by hash"
                  />
                  <CommandBlock
                    command={castCommands.getReceipt}
                    label="Get Receipt"
                    onCopy={copyCommand}
                    isCopied={copiedCommand === "Get Receipt"}
                    description="Get transaction receipt with logs"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="space-y-4">
            <Tabs defaultValue="viem" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="viem">Viem</TabsTrigger>
                <TabsTrigger value="ethers">Ethers.js</TabsTrigger>
                <TabsTrigger value="web3">Web3.js</TabsTrigger>
              </TabsList>

              <TabsContent value="viem">
                <CodeBlock
                  code={viemExample}
                  language="typescript"
                  onCopy={() => copyCommand(viemExample, "Viem example")}
                  isCopied={copiedCommand === "Viem example"}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Install: <code className="bg-muted px-1 py-0.5 rounded">npm install viem</code>
                </p>
              </TabsContent>

              <TabsContent value="ethers">
                <CodeBlock
                  code={ethersExample}
                  language="typescript"
                  onCopy={() => copyCommand(ethersExample, "Ethers.js example")}
                  isCopied={copiedCommand === "Ethers.js example"}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Install: <code className="bg-muted px-1 py-0.5 rounded">npm install ethers</code>
                </p>
              </TabsContent>

              <TabsContent value="web3">
                <CodeBlock
                  code={web3Example}
                  language="typescript"
                  onCopy={() => copyCommand(web3Example, "Web3.js example")}
                  isCopied={copiedCommand === "Web3.js example"}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Install: <code className="bg-muted px-1 py-0.5 rounded">npm install web3</code>
                </p>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
}

interface CommandBlockProps {
  command: string;
  label: string;
  description?: string;
  onCopy: (command: string, label: string) => void;
  isCopied: boolean;
}

function CommandBlock({ command, label, description, onCopy, isCopied }: CommandBlockProps) {
  return (
    <div className="relative group">
      <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
        <div className="flex-1 min-w-0">
          {description && (
            <p className="text-xs text-muted-foreground mb-1">{description}</p>
          )}
          <code className="text-xs font-mono break-all block">{command}</code>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 ml-2 flex-shrink-0"
          onClick={() => onCopy(command, label)}
        >
          {isCopied ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}

interface CodeBlockProps {
  code: string;
  language: string;
  onCopy: () => void;
  isCopied: boolean;
}

function CodeBlock({ code, language, onCopy, isCopied }: CodeBlockProps) {
  return (
    <div className="relative group">
      <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50">
        <pre className="flex-1 overflow-x-auto">
          <code className="text-xs font-mono">{code}</code>
        </pre>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 ml-2 flex-shrink-0"
          onClick={onCopy}
        >
          {isCopied ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}
