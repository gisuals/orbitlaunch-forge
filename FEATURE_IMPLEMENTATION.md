# Advanced Orbit Features Implementation Plan

## Overview
Implementing three major features to enhance OrbitLaunch platform functionality.

---

## Feature 1: Custom Gas Token Selection

### User Flow
1. User selects "Use Custom Gas Token" checkbox
2. Enters ERC-20 token contract address
3. System validates token exists and is ERC-20 compliant
4. Displays token name, symbol, and decimals
5. User confirms and deploys with custom gas token

### Technical Implementation
- **Frontend**: New token selector component
- **Contract**: Store gas token address in metadata
- **Validation**: Check ERC-20 interface (name, symbol, decimals)
- **IPFS**: Include gasTokenAddress in metadata

### Files to Create/Modify
- `src/components/GasTokenSelector.tsx` (new)
- `src/lib/erc20.ts` (new - token validation)
- `src/pages/Deploy.tsx` (modify - add gas token field)
- `contracts/OrbitLaunchRegistry.sol` (modify - if needed)

---

## Feature 2: Pre-configured Templates

### Templates
1. **Gaming Chain**
   - High throughput
   - Low transaction costs
   - Optimized for NFTs and in-game assets
   - Pre-configured RPC settings

2. **DeFi Chain**
   - High security
   - MEV protection
   - Fast finality
   - Optimized for financial transactions

3. **NFT Marketplace Chain**
   - Optimized for NFT minting/trading
   - IPFS integration
   - Royalty support
   - Low gas for transfers

4. **General Purpose Chain**
   - Balanced settings
   - Standard Arbitrum Orbit configuration

### Technical Implementation
- **Frontend**: Template selector cards
- **Config**: Template definitions with pre-populated values
- **UX**: One-click template selection with customization option

### Files to Create
- `src/config/templates.ts` (new - template definitions)
- `src/components/TemplateSelector.tsx` (new)
- `src/pages/Deploy.tsx` (modify - integrate templates)

---

## Feature 3: Chain Management Dashboard

### Dashboard Features
1. **Chain Overview**
   - Chain name, symbol, status
   - Deployment date
   - Contract address
   - Explorer link

2. **Live Stats**
   - Current block number
   - Recent block time
   - Total transactions (if available)
   - Chain ID

3. **Configuration Details**
   - Base network
   - Gas token (if custom)
   - RPC URL
   - Template used

4. **Actions**
   - View on explorer
   - Copy RPC URL
   - Export configuration
   - Share chain details

### Technical Implementation
- **Frontend**: New dashboard page
- **Data**: Read from contract + RPC queries
- **Routing**: `/dashboard/:deploymentId`
- **State**: Real-time data fetching

### Files to Create
- `src/pages/Dashboard.tsx` (new)
- `src/components/ChainStatsCard.tsx` (new)
- `src/components/DeploymentList.tsx` (new)
- `src/hooks/useChainStats.ts` (new)
- `src/lib/rpc.ts` (new - RPC queries)

---

## Smart Contract Updates

### New Fields in Metadata
```solidity
struct ExtendedMetadata {
    // Existing
    string chainName;
    string symbol;
    string nativeToken;
    string description;
    string baseNetwork;
    string rpcUrl;

    // New
    address gasTokenAddress;  // 0x0 for ETH, otherwise ERC-20
    string templateType;      // "gaming", "defi", "nft", "general"
    uint256 deploymentDate;
    bool isActive;
}
```

### Contract Functions (if needed)
- `updateChainStatus()` - Mark chain as active/inactive
- `getChainStats()` - Get basic chain statistics

---

## Implementation Order

### Phase 1: Templates (Easiest)
1. Create template definitions
2. Build template selector UI
3. Integrate with deploy form
4. Test template selection flow

### Phase 2: Custom Gas Token
1. Create ERC-20 validation library
2. Build gas token selector component
3. Add token validation
4. Update IPFS metadata structure
5. Test with real ERC-20 tokens

### Phase 3: Dashboard
1. Create dashboard page layout
2. Implement deployment list
3. Add RPC query functions
4. Build stats cards
5. Add real-time updates
6. Test with deployed chains

---

## Testing Checklist

### Templates
- [ ] All templates load correctly
- [ ] Template selection populates form
- [ ] Custom values can override template
- [ ] Templates save to IPFS correctly

### Gas Token
- [ ] Valid ERC-20 addresses accepted
- [ ] Invalid addresses rejected
- [ ] Token info displays correctly
- [ ] Default ETH option works
- [ ] Gas token saved in metadata

### Dashboard
- [ ] Dashboard loads with deployment data
- [ ] Stats update in real-time
- [ ] RPC queries work correctly
- [ ] Multiple deployments listed
- [ ] Export/share features work

---

## UI/UX Considerations

1. **Progressive Disclosure**: Advanced features behind "Advanced Options" section
2. **Defaults**: Sensible defaults for all fields
3. **Validation**: Real-time validation with clear error messages
4. **Help Text**: Tooltips and info icons explaining each option
5. **Responsive**: All features work on mobile
6. **Loading States**: Clear indicators during async operations

---

## Security Considerations

1. **Gas Token Validation**:
   - Verify ERC-20 interface
   - Check token is not malicious
   - Warn about token risks

2. **RPC Queries**:
   - Use read-only calls
   - Handle RPC failures gracefully
   - No private key exposure

3. **Input Sanitization**:
   - Validate all user inputs
   - Prevent XSS attacks
   - Check address format

---

## Deployment Checklist

- [ ] All TypeScript types defined
- [ ] Components properly tested
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Wallet integration works
- [ ] IPFS uploads succeed
- [ ] Contract interactions succeed
- [ ] Documentation updated
- [ ] README updated with new features

---

## Success Metrics

1. Users can select and deploy with templates
2. Custom gas tokens can be configured
3. Dashboard displays accurate data
4. All features work on Arbitrum Sepolia
5. No errors in browser console
6. Smooth user experience

---

**Ready to implement! 🚀**
