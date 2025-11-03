# MetaMask & Cast Interaction Testing Guide

## 🎯 What We Implemented

We added two major features to ensure deployed chains are functional and can be interacted with:

1. **"Add to MetaMask" Button** - One-click network addition to MetaMask
2. **Chain Interaction Guide** - Comprehensive guide with examples for MetaMask, Cast/Forge, and code libraries

---

## 🧪 How to Test

### Prerequisites
- ✅ MetaMask browser extension installed
- ✅ Dev server running at http://localhost:8081
- ✅ Test deployment data in sessionStorage (from a previous deployment)

---

## Test Scenario 1: Success Page (After Deployment)

### Navigate to Success Page
1. Open browser: http://localhost:8081
2. Connect wallet
3. Go to Deploy page
4. Fill form and deploy a chain (or use existing deployment in sessionStorage)
5. After successful deployment, you'll be redirected to Success page

### ✅ What You Should See on Success Page:

#### Section 1: Chain Details Card
- Standard deployment information (chain name, symbol, RPC URL, etc.)
- Transaction hash with Arbiscan link
- "View Dashboard" and "View Contract" buttons

#### Section 2: **NEW - Add Network to MetaMask Card**
Located right below the chain details card, you should see:

**If RPC URL is a placeholder (not deployed yet):**
```
┌─────────────────────────────────────────┐
│ Add Network to MetaMask                 │
├─────────────────────────────────────────┤
│ ⚠️ RPC URL Not Configured               │
│                                         │
│ This chain uses a placeholder RPC URL.  │
│ You'll need to deploy your actual       │
│ Arbitrum Orbit chain and update the     │
│ RPC URL before you can add it to        │
│ MetaMask and interact with it.          │
└─────────────────────────────────────────┘
```

**If RPC URL is valid (real deployment):**
```
┌─────────────────────────────────────────┐
│ Add Network to MetaMask                 │
├─────────────────────────────────────────┤
│ Add this chain to MetaMask to start     │
│ interacting with it. This will:         │
│                                         │
│ • Add [Chain Name] to your network list │
│ • Configure the RPC endpoint            │
│ • Set up the native token ([SYMBOL])   │
│ • Link the block explorer               │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │   🦊 Add to MetaMask                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ After adding, you can send transactions,│
│ check balances, and interact with       │
│ smart contracts on this chain.          │
└─────────────────────────────────────────┘
```

#### Section 3: **NEW - Interact with Your Chain Card**
A tabbed interface with three options:

**Tab 1: MetaMask**
```
┌─────────────────────────────────────────┐
│ 🔷 MetaMask  |  Terminal  |  Code      │
├─────────────────────────────────────────┤
│ Using MetaMask                          │
│                                         │
│ After adding the network to MetaMask:   │
│                                         │
│ ✅ Switch to [Chain Name]               │
│    Open MetaMask → Click network        │
│    dropdown → Select "[Chain Name]"     │
│                                         │
│ ✅ View Your Balance                    │
│    Your [SYMBOL] balance displayed      │
│                                         │
│ ✅ Send Transactions                    │
│    Use MetaMask to send [SYMBOL]        │
│                                         │
│ ✅ Interact with dApps                  │
│    Connect MetaMask to dApps            │
│                                         │
│ ✅ Add Tokens                           │
│    Import custom ERC-20 tokens          │
│                                         │
│ Block Explorer: [link]                  │
└─────────────────────────────────────────┘
```

**Tab 2: Cast/Forge**
```
┌─────────────────────────────────────────┐
│ MetaMask  |  🔷 Terminal  |  Code      │
├─────────────────────────────────────────┤
│ Using Foundry (cast/forge)              │
│                                         │
│ Install: curl -L foundry... [Copy]     │
│                                         │
│ 🏷️ Chain Info                          │
│ ┌─────────────────────────────────────┐ │
│ │ Get Chain ID                  [Copy]│ │
│ │ cast chain-id --rpc-url [URL]      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Get Block Number              [Copy]│ │
│ │ cast block-number --rpc-url [URL]  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🏷️ Account Operations                  │
│ [Multiple command blocks with copy]    │
│                                         │
│ 🏷️ Smart Contracts                     │
│ [Deploy and call commands]              │
│                                         │
│ 🏷️ Block & Transaction Data            │
│ [Query commands]                        │
└─────────────────────────────────────────┘
```

**Tab 3: Code**
Sub-tabs for Viem, Ethers.js, Web3.js with complete code examples:
```
┌─────────────────────────────────────────┐
│ MetaMask  |  Terminal  |  🔷 Code      │
├─────────────────────────────────────────┤
│ 🔷 Viem  |  Ethers.js  |  Web3.js     │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ import { createPublicClient... [📋]│ │
│ │                                     │ │
│ │ const publicClient = create...      │ │
│ │                                     │ │
│ │ // Get block number                │ │
│ │ const blockNumber = await...       │ │
│ │                                     │ │
│ │ // Get balance                     │ │
│ │ const balance = await...           │ │
│ │                                     │ │
│ │ // Send transaction                │ │
│ │ const hash = await...              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Install: npm install viem               │
└─────────────────────────────────────────┘
```

---

## Test Scenario 2: Dashboard Page

### Navigate to Dashboard
1. From Success page, click "View Dashboard" button
2. Or navigate directly to http://localhost:8081/dashboard (if deployment data in sessionStorage)

### ✅ What You Should See on Dashboard:

#### Header Section
In the top right, next to "Export Config" and "View on Explorer" buttons:

**If RPC URL is valid:**
```
┌────────────────────────────────────────────┐
│ [🦊 Add to MetaMask] [Export] [View...]   │
└────────────────────────────────────────────┘
```

**If RPC URL is placeholder:**
- "Add to MetaMask" button will NOT appear (smart conditional rendering)

#### Bottom Section: **NEW - Interact with Your Chain**
Same comprehensive guide as Success page (3 tabs: MetaMask, Cast/Forge, Code)

---

## 🧪 Interactive Testing Steps

### Test 1: Add to MetaMask Button (Valid RPC)

**Setup:**
1. You need a deployment with a REAL RPC URL (not placeholder)
2. For testing, you can manually update sessionStorage:
```javascript
// In browser console:
const data = JSON.parse(sessionStorage.getItem('deploymentData'));
data.rpcUrl = 'https://sepolia-rollup.arbitrum.io/rpc'; // Use real Arbitrum Sepolia
sessionStorage.setItem('deploymentData', JSON.stringify(data));
location.reload();
```

**Expected Behavior:**
1. ✅ Button shows: "🦊 Add to MetaMask"
2. ✅ Click button
3. ✅ MetaMask popup appears asking to add network
4. ✅ Network details pre-filled:
   - Network Name: [Your Chain Name]
   - RPC URL: [Your RPC URL]
   - Chain ID: [Your Chain ID]
   - Currency Symbol: [Your Symbol]
   - Explorer URL: [If provided]
5. ✅ Click "Approve" in MetaMask
6. ✅ Button changes to "✅ Added Successfully!" (for 3 seconds)
7. ✅ Toast notification: "Network added to MetaMask!"
8. ✅ Network now visible in MetaMask network dropdown

**Error Cases to Test:**
- No MetaMask installed → Error toast with "Install MetaMask" button
- User rejects → Info toast: "Request cancelled"
- Network already added → MetaMask shows warning

### Test 2: Add to MetaMask Button (Placeholder RPC)

**Setup:**
1. Default deployment creates placeholder RPC like: `https://rpc.my-chain.arbitrum.io`

**Expected Behavior:**
1. ✅ Shows warning card instead of button:
   ```
   ⚠️ RPC URL Not Configured
   
   This chain uses a placeholder RPC URL. You'll need to deploy
   your actual Arbitrum Orbit chain and update the RPC URL before
   you can add it to MetaMask and interact with it.
   ```
2. ✅ Button does NOT appear
3. ✅ Clicking nothing happens (no button to click)

### Test 3: Copy Commands (Cast Tab)

**Expected Behavior:**
1. ✅ Click any command's copy button (📋 icon)
2. ✅ Command copied to clipboard
3. ✅ Toast: "[Command Name] copied to clipboard!"
4. ✅ Copy button briefly shows checkmark ✅
5. ✅ Paste in terminal - command includes your actual RPC URL

**Try These:**
- "Get Chain ID" → Should copy: `cast chain-id --rpc-url [YOUR_RPC]`
- "Send Transaction" → Should copy full command with placeholders

### Test 4: Copy Code Examples (Code Tab)

**Expected Behavior:**
1. ✅ Switch between Viem/Ethers.js/Web3.js tabs
2. ✅ Each shows different code syntax
3. ✅ All include your actual RPC URL
4. ✅ Click copy button → Full code copied
5. ✅ Toast: "[Library] example copied to clipboard!"
6. ✅ Code is valid and can be pasted into a project

### Test 5: Responsive Behavior

**Expected Behavior:**
1. ✅ On mobile (narrow screen):
   - Tabs stack properly
   - Buttons are full width
   - Code blocks scroll horizontally
2. ✅ On desktop:
   - Tabs display horizontally
   - Buttons fit in rows
   - Everything readable

---

## 🔍 Visual Verification Checklist

Open your browser and check each page:

### Success Page (`/success`)
- [ ] Chain details card displays correctly
- [ ] "Add Network to MetaMask" section appears
- [ ] Warning OR button shows (depending on RPC URL)
- [ ] "Interact with Your Chain" card appears
- [ ] Three tabs visible: MetaMask, Cast/Forge, Code
- [ ] MetaMask tab shows 5 checkmarks with instructions
- [ ] Cast/Forge tab shows grouped commands with badges
- [ ] Code tab shows 3 sub-tabs: Viem, Ethers.js, Web3.js
- [ ] All copy buttons work
- [ ] Your chain name and RPC URL appear in examples

### Dashboard Page (`/dashboard`)
- [ ] Header shows stats (Block Number, Gas Price, etc.)
- [ ] "Add to MetaMask" button in header (if valid RPC)
- [ ] Chain configuration section displays correctly
- [ ] "Interact with Your Chain" card at bottom
- [ ] Same 3-tab interface as Success page
- [ ] All functionality identical to Success page

---

## 📸 Screenshots to Verify

Take screenshots of:
1. ✅ Success page with all 3 sections visible
2. ✅ "Add to MetaMask" button hover state
3. ✅ MetaMask popup when adding network
4. ✅ Cast/Forge tab with all command blocks
5. ✅ Code tab with Viem/Ethers.js/Web3.js examples
6. ✅ Dashboard with "Add to MetaMask" in header
7. ✅ Copy button feedback (checkmark state)
8. ✅ Toast notifications

---

## 🐛 Common Issues & Fixes

### Issue: "Add to MetaMask" button doesn't appear
**Cause:** RPC URL is placeholder or invalid
**Fix:** Update RPC URL to real endpoint or check conditional logic

### Issue: MetaMask popup doesn't appear
**Cause:** MetaMask not installed or window.ethereum undefined
**Fix:** Install MetaMask extension, restart browser

### Issue: Commands don't include RPC URL
**Cause:** RPC URL not passed to component
**Fix:** Check component props in Success.tsx/Dashboard.tsx

### Issue: Copy buttons don't work
**Cause:** Clipboard API not available (needs HTTPS or localhost)
**Fix:** You're on localhost, should work. Check browser console.

---

## ✅ Success Criteria

Your implementation is working correctly if:

1. ✅ **Success Page**: Shows 3 distinct sections (details, add to MetaMask, interaction guide)
2. ✅ **Dashboard Page**: Shows "Add to MetaMask" button in header + guide at bottom
3. ✅ **MetaMask Integration**: Button triggers MetaMask popup with correct network details
4. ✅ **Cast Commands**: All commands include actual RPC URL and copy to clipboard
5. ✅ **Code Examples**: All 3 libraries show valid code with your RPC URL
6. ✅ **Conditional Rendering**: Warning shows for placeholder URLs, button shows for real URLs
7. ✅ **Copy Functionality**: All copy buttons work and show feedback
8. ✅ **Responsive Design**: Works on mobile and desktop
9. ✅ **No Console Errors**: Browser console is clean
10. ✅ **Build Success**: `npm run build` completes without errors ✅ (Already verified)

---

## 🚀 Next Steps After Testing

Once you verify everything works:

1. Take screenshots of the new features
2. Push to your fork: `git push fork feat/add-metamask-cast-interaction`
3. Create PR from your fork to upstream
4. Include screenshots in PR description
5. Deploy to production

---

## 📝 Testing Notes

**Current Status:**
- ✅ Build completes successfully
- ✅ TypeScript compiles without errors
- ✅ All components created and integrated
- ⏳ Awaiting manual testing with MetaMask
- ⏳ Awaiting visual verification

**Test Environment:**
- Dev Server: http://localhost:8081
- Pages to test: `/success` and `/dashboard`
- Required: MetaMask browser extension
- Optional: Foundry (cast) for command testing
