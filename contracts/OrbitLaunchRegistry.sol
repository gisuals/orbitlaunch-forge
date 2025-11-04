// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OrbitLaunchRegistry
 * @notice Gas-optimized registry for Arbitrum deployment metadata
 * @dev Uses IPFS for metadata, events for indexing via The Graph
 */
contract OrbitLaunchRegistry {

    struct Deployment {
        bytes32 metadataHash; // IPFS hash (32 bytes, cheaper than string)
        uint64 chainId;       // Packed to uint64 (sufficient for chain IDs)
        uint64 timestamp;     // Packed to uint64
        address deployer;     // 20 bytes
    }

    // Storage
    mapping(address => bytes32[]) private userDeploymentIds;
    mapping(bytes32 => Deployment) public deployments;
    uint256 public totalDeployments;

    // Events (indexed for The Graph)
    event DeploymentRegistered(
        bytes32 indexed deploymentId,
        address indexed deployer,
        bytes32 metadataHash,
        uint64 chainId,
        uint64 timestamp
    );

    event DeploymentUpdated(
        bytes32 indexed deploymentId,
        bytes32 newMetadataHash
    );

    /**
     * @notice Register new deployment (gas optimized)
     * @param _metadataHash IPFS hash containing chainName, symbol, description, etc.
     * @param _chainId The deployed chain ID
     */
    function registerDeployment(
        bytes32 _metadataHash,
        uint64 _chainId
    ) external returns (bytes32 deploymentId) {
        // Generate unique deployment ID
        deploymentId = keccak256(
            abi.encodePacked(
                msg.sender,
                block.timestamp,
                totalDeployments
            )
        );

        // Store deployment
        deployments[deploymentId] = Deployment({
            metadataHash: _metadataHash,
            chainId: _chainId,
            timestamp: uint64(block.timestamp),
            deployer: msg.sender
        });

        // Track user deployments
        userDeploymentIds[msg.sender].push(deploymentId);

        unchecked {
            ++totalDeployments;
        }

        emit DeploymentRegistered(
            deploymentId,
            msg.sender,
            _metadataHash,
            _chainId,
            uint64(block.timestamp)
        );
    }

    /**
     * @notice Update deployment metadata
     * @param _deploymentId The deployment to update
     * @param _newMetadataHash New IPFS hash
     */
    function updateDeployment(
        bytes32 _deploymentId,
        bytes32 _newMetadataHash
    ) external {
        require(
            deployments[_deploymentId].deployer == msg.sender,
            "Not deployer"
        );

        deployments[_deploymentId].metadataHash = _newMetadataHash;

        emit DeploymentUpdated(_deploymentId, _newMetadataHash);
    }

    /**
     * @notice Get user's deployment IDs
     * @param _user User address
     * @return Array of deployment IDs
     */
    function getUserDeploymentIds(address _user)
        external
        view
        returns (bytes32[] memory)
    {
        return userDeploymentIds[_user];
    }

    /**
     * @notice Get deployment details
     * @param _deploymentId Deployment ID
     * @return Deployment struct
     */
    function getDeployment(bytes32 _deploymentId)
        external
        view
        returns (Deployment memory)
    {
        return deployments[_deploymentId];
    }
}
