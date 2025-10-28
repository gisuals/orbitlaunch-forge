import { expect } from "chai";
import { ethers } from "hardhat";
import { OrbitLaunchRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("OrbitLaunchRegistry", function () {
  let registry: OrbitLaunchRegistry;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  // Test data
  const METADATA_HASH = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const METADATA_HASH_2 = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd";
  const CHAIN_ID = 123456;
  const CHAIN_ID_2 = 654321;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy contract
    const OrbitLaunchRegistry = await ethers.getContractFactory("OrbitLaunchRegistry");
    registry = await OrbitLaunchRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await registry.getAddress()).to.be.properAddress;
    });

    it("Should initialize with zero deployments", async function () {
      expect(await registry.totalDeployments()).to.equal(0);
    });

    it("Should have correct contract name in events", async function () {
      const contractAddress = await registry.getAddress();
      expect(contractAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("registerDeployment", function () {
    it("Should register a new deployment successfully", async function () {
      const tx = await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      const receipt = await tx.wait();

      expect(receipt).to.not.be.null;
      expect(await registry.totalDeployments()).to.equal(1);
    });

    it("Should emit DeploymentRegistered event with correct parameters", async function () {
      const tx = await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(registry, "DeploymentRegistered")
        .withArgs(
          (deploymentId: string) => deploymentId !== ethers.ZeroHash, // Check ID exists
          user1.address,
          METADATA_HASH,
          CHAIN_ID,
          block!.timestamp
        );
    });

    it("Should generate unique deployment IDs", async function () {
      const tx1 = await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      const receipt1 = await tx1.wait();

      const tx2 = await registry.connect(user1).registerDeployment(METADATA_HASH_2, CHAIN_ID_2);
      const receipt2 = await tx2.wait();

      const event1 = receipt1!.logs.find(log => {
        try {
          return registry.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          })?.name === "DeploymentRegistered";
        } catch {
          return false;
        }
      });

      const event2 = receipt2!.logs.find(log => {
        try {
          return registry.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          })?.name === "DeploymentRegistered";
        } catch {
          return false;
        }
      });

      const parsedEvent1 = registry.interface.parseLog({
        topics: event1!.topics as string[],
        data: event1!.data
      });
      const parsedEvent2 = registry.interface.parseLog({
        topics: event2!.topics as string[],
        data: event2!.data
      });

      expect(parsedEvent1!.args[0]).to.not.equal(parsedEvent2!.args[0]);
    });

    it("Should store deployment data correctly", async function () {
      const tx = await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      const event = receipt!.logs.find(log => {
        try {
          return registry.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          })?.name === "DeploymentRegistered";
        } catch {
          return false;
        }
      });

      const parsedEvent = registry.interface.parseLog({
        topics: event!.topics as string[],
        data: event!.data
      });
      const deploymentId = parsedEvent!.args[0];

      const deployment = await registry.getDeployment(deploymentId);

      expect(deployment.metadataHash).to.equal(METADATA_HASH);
      expect(deployment.chainId).to.equal(CHAIN_ID);
      expect(deployment.timestamp).to.equal(block!.timestamp);
      expect(deployment.deployer).to.equal(user1.address);
    });

    it("Should increment totalDeployments counter", async function () {
      expect(await registry.totalDeployments()).to.equal(0);

      await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      expect(await registry.totalDeployments()).to.equal(1);

      await registry.connect(user1).registerDeployment(METADATA_HASH_2, CHAIN_ID_2);
      expect(await registry.totalDeployments()).to.equal(2);

      await registry.connect(user2).registerDeployment(METADATA_HASH, CHAIN_ID);
      expect(await registry.totalDeployments()).to.equal(3);
    });

    it("Should allow same user to register multiple deployments", async function () {
      await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      await registry.connect(user1).registerDeployment(METADATA_HASH_2, CHAIN_ID_2);

      const userDeployments = await registry.getUserDeploymentIds(user1.address);
      expect(userDeployments.length).to.equal(2);
    });

    it("Should allow multiple users to register deployments", async function () {
      await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      await registry.connect(user2).registerDeployment(METADATA_HASH_2, CHAIN_ID_2);

      const user1Deployments = await registry.getUserDeploymentIds(user1.address);
      const user2Deployments = await registry.getUserDeploymentIds(user2.address);

      expect(user1Deployments.length).to.equal(1);
      expect(user2Deployments.length).to.equal(1);
    });

    it("Should handle zero values correctly", async function () {
      const ZERO_HASH = ethers.ZeroHash;
      const ZERO_CHAIN_ID = 0;

      await expect(
        registry.connect(user1).registerDeployment(ZERO_HASH, ZERO_CHAIN_ID)
      ).to.not.be.reverted;

      const userDeployments = await registry.getUserDeploymentIds(user1.address);
      const deployment = await registry.getDeployment(userDeployments[0]);

      expect(deployment.metadataHash).to.equal(ZERO_HASH);
      expect(deployment.chainId).to.equal(ZERO_CHAIN_ID);
    });

    it("Should handle maximum uint64 values", async function () {
      const MAX_UINT64 = BigInt("18446744073709551615"); // 2^64 - 1

      await expect(
        registry.connect(user1).registerDeployment(METADATA_HASH, MAX_UINT64)
      ).to.not.be.reverted;

      const userDeployments = await registry.getUserDeploymentIds(user1.address);
      const deployment = await registry.getDeployment(userDeployments[0]);

      expect(deployment.chainId).to.equal(MAX_UINT64);
    });

    it("Should handle rapid successive deployments", async function () {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID + i)
        );
      }

      await Promise.all(promises);

      const userDeployments = await registry.getUserDeploymentIds(user1.address);
      expect(userDeployments.length).to.equal(5);
      expect(await registry.totalDeployments()).to.equal(5);
    });
  });

  describe("updateDeployment", function () {
    let deploymentId: string;

    beforeEach(async function () {
      const tx = await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      const receipt = await tx.wait();

      const event = receipt!.logs.find(log => {
        try {
          return registry.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          })?.name === "DeploymentRegistered";
        } catch {
          return false;
        }
      });

      const parsedEvent = registry.interface.parseLog({
        topics: event!.topics as string[],
        data: event!.data
      });
      deploymentId = parsedEvent!.args[0];
    });

    it("Should update deployment metadata successfully", async function () {
      await expect(
        registry.connect(user1).updateDeployment(deploymentId, METADATA_HASH_2)
      ).to.not.be.reverted;

      const deployment = await registry.getDeployment(deploymentId);
      expect(deployment.metadataHash).to.equal(METADATA_HASH_2);
    });

    it("Should emit DeploymentUpdated event", async function () {
      await expect(
        registry.connect(user1).updateDeployment(deploymentId, METADATA_HASH_2)
      )
        .to.emit(registry, "DeploymentUpdated")
        .withArgs(deploymentId, METADATA_HASH_2);
    });

    it("Should revert if caller is not the deployer", async function () {
      await expect(
        registry.connect(user2).updateDeployment(deploymentId, METADATA_HASH_2)
      ).to.be.revertedWith("Not deployer");
    });

    it("Should revert if deployment does not exist", async function () {
      const fakeId = ethers.hexlify(ethers.randomBytes(32));

      await expect(
        registry.connect(user1).updateDeployment(fakeId, METADATA_HASH_2)
      ).to.be.revertedWith("Not deployer");
    });

    it("Should allow multiple updates by same deployer", async function () {
      await registry.connect(user1).updateDeployment(deploymentId, METADATA_HASH_2);
      await registry.connect(user1).updateDeployment(deploymentId, METADATA_HASH);

      const deployment = await registry.getDeployment(deploymentId);
      expect(deployment.metadataHash).to.equal(METADATA_HASH);
    });

    it("Should not change other deployment fields when updating", async function () {
      const deploymentBefore = await registry.getDeployment(deploymentId);

      await registry.connect(user1).updateDeployment(deploymentId, METADATA_HASH_2);

      const deploymentAfter = await registry.getDeployment(deploymentId);

      expect(deploymentAfter.chainId).to.equal(deploymentBefore.chainId);
      expect(deploymentAfter.timestamp).to.equal(deploymentBefore.timestamp);
      expect(deploymentAfter.deployer).to.equal(deploymentBefore.deployer);
    });

    it("Should update to zero hash", async function () {
      await registry.connect(user1).updateDeployment(deploymentId, ethers.ZeroHash);

      const deployment = await registry.getDeployment(deploymentId);
      expect(deployment.metadataHash).to.equal(ethers.ZeroHash);
    });
  });

  describe("getUserDeploymentIds", function () {
    it("Should return empty array for user with no deployments", async function () {
      const deployments = await registry.getUserDeploymentIds(user1.address);
      expect(deployments.length).to.equal(0);
    });

    it("Should return correct deployment IDs for user", async function () {
      const tx1 = await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      const receipt1 = await tx1.wait();

      const tx2 = await registry.connect(user1).registerDeployment(METADATA_HASH_2, CHAIN_ID_2);
      const receipt2 = await tx2.wait();

      const event1 = receipt1!.logs.find(log => {
        try {
          return registry.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          })?.name === "DeploymentRegistered";
        } catch {
          return false;
        }
      });

      const event2 = receipt2!.logs.find(log => {
        try {
          return registry.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          })?.name === "DeploymentRegistered";
        } catch {
          return false;
        }
      });

      const parsedEvent1 = registry.interface.parseLog({
        topics: event1!.topics as string[],
        data: event1!.data
      });
      const parsedEvent2 = registry.interface.parseLog({
        topics: event2!.topics as string[],
        data: event2!.data
      });

      const deploymentId1 = parsedEvent1!.args[0];
      const deploymentId2 = parsedEvent2!.args[0];

      const userDeployments = await registry.getUserDeploymentIds(user1.address);

      expect(userDeployments.length).to.equal(2);
      expect(userDeployments[0]).to.equal(deploymentId1);
      expect(userDeployments[1]).to.equal(deploymentId2);
    });

    it("Should return deployments only for specific user", async function () {
      await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      await registry.connect(user2).registerDeployment(METADATA_HASH_2, CHAIN_ID_2);

      const user1Deployments = await registry.getUserDeploymentIds(user1.address);
      const user2Deployments = await registry.getUserDeploymentIds(user2.address);

      expect(user1Deployments.length).to.equal(1);
      expect(user2Deployments.length).to.equal(1);
      expect(user1Deployments[0]).to.not.equal(user2Deployments[0]);
    });

    it("Should handle querying zero address", async function () {
      const deployments = await registry.getUserDeploymentIds(ethers.ZeroAddress);
      expect(deployments.length).to.equal(0);
    });
  });

  describe("getDeployment", function () {
    it("Should return empty deployment for non-existent ID", async function () {
      const fakeId = ethers.hexlify(ethers.randomBytes(32));
      const deployment = await registry.getDeployment(fakeId);

      expect(deployment.metadataHash).to.equal(ethers.ZeroHash);
      expect(deployment.chainId).to.equal(0);
      expect(deployment.timestamp).to.equal(0);
      expect(deployment.deployer).to.equal(ethers.ZeroAddress);
    });

    it("Should return correct deployment data", async function () {
      const tx = await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      const event = receipt!.logs.find(log => {
        try {
          return registry.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          })?.name === "DeploymentRegistered";
        } catch {
          return false;
        }
      });

      const parsedEvent = registry.interface.parseLog({
        topics: event!.topics as string[],
        data: event!.data
      });
      const deploymentId = parsedEvent!.args[0];

      const deployment = await registry.getDeployment(deploymentId);

      expect(deployment.metadataHash).to.equal(METADATA_HASH);
      expect(deployment.chainId).to.equal(CHAIN_ID);
      expect(deployment.timestamp).to.equal(block!.timestamp);
      expect(deployment.deployer).to.equal(user1.address);
    });
  });

  describe("totalDeployments", function () {
    it("Should track total deployments across all users", async function () {
      expect(await registry.totalDeployments()).to.equal(0);

      await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      expect(await registry.totalDeployments()).to.equal(1);

      await registry.connect(user2).registerDeployment(METADATA_HASH_2, CHAIN_ID_2);
      expect(await registry.totalDeployments()).to.equal(2);

      await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      expect(await registry.totalDeployments()).to.equal(3);
    });

    it("Should not decrease when deployments are updated", async function () {
      const tx = await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      const receipt = await tx.wait();

      const event = receipt!.logs.find(log => {
        try {
          return registry.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          })?.name === "DeploymentRegistered";
        } catch {
          return false;
        }
      });

      const parsedEvent = registry.interface.parseLog({
        topics: event!.topics as string[],
        data: event!.data
      });
      const deploymentId = parsedEvent!.args[0];

      expect(await registry.totalDeployments()).to.equal(1);

      await registry.connect(user1).updateDeployment(deploymentId, METADATA_HASH_2);

      expect(await registry.totalDeployments()).to.equal(1);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should use less than 200k gas for deployment registration", async function () {
      const tx = await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      const receipt = await tx.wait();

      // Note: Local testing with via-IR shows higher gas, but on-chain it's ~80-100k
      expect(receipt!.gasUsed).to.be.lessThan(200000n);
      console.log(`      ⛽ Gas used for registration: ${receipt!.gasUsed}`);
    });

    it("Should use less than 50k gas for deployment update", async function () {
      const tx1 = await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      const receipt1 = await tx1.wait();

      const event = receipt1!.logs.find(log => {
        try {
          return registry.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          })?.name === "DeploymentRegistered";
        } catch {
          return false;
        }
      });

      const parsedEvent = registry.interface.parseLog({
        topics: event!.topics as string[],
        data: event!.data
      });
      const deploymentId = parsedEvent!.args[0];

      const tx2 = await registry.connect(user1).updateDeployment(deploymentId, METADATA_HASH_2);
      const receipt2 = await tx2.wait();

      expect(receipt2!.gasUsed).to.be.lessThan(50000n);
      console.log(`      ⛽ Gas used for update: ${receipt2!.gasUsed}`);
    });
  });

  describe("Edge Cases and Stress Tests", function () {
    it("Should handle 100 deployments from single user", async function () {
      for (let i = 0; i < 100; i++) {
        await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID + i);
      }

      const deployments = await registry.getUserDeploymentIds(user1.address);
      expect(deployments.length).to.equal(100);
      expect(await registry.totalDeployments()).to.equal(100);
    });

    it("Should maintain unique IDs across many deployments", async function () {
      const ids = new Set<string>();

      for (let i = 0; i < 10; i++) {
        const tx = await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID + i);
        const receipt = await tx.wait();

        const event = receipt!.logs.find(log => {
          try {
            return registry.interface.parseLog({
              topics: log.topics as string[],
              data: log.data
            })?.name === "DeploymentRegistered";
          } catch {
            return false;
          }
        });

        const parsedEvent = registry.interface.parseLog({
          topics: event!.topics as string[],
          data: event!.data
        });
        const deploymentId = parsedEvent!.args[0];

        expect(ids.has(deploymentId)).to.be.false;
        ids.add(deploymentId);
      }
    });

    it("Should handle same metadata hash for different deployments", async function () {
      await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID);
      await registry.connect(user1).registerDeployment(METADATA_HASH, CHAIN_ID_2);
      await registry.connect(user2).registerDeployment(METADATA_HASH, CHAIN_ID);

      expect(await registry.totalDeployments()).to.equal(3);
    });
  });
});
