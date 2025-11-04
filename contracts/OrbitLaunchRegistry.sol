// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DeploymentRegistry {
    address public immutable deployer;

    struct Deployment {
        uint256 chainId;
        address contractAddress;
        string version;
    }

    mapping(bytes32 => Deployment) public deployments;
    mapping(address => bytes32[]) public userDeploymentIds;

    constructor(address _deployer) {
        require(_deployer != address(0), "Deployer cannot be zero");
        deployer = _deployer;
    }

    function updateDeployment(
        uint256 _chainId,
        address _contractAddress,
        string memory _version
    ) external {
        require(msg.sender == deployer, "Not deployer");
        require(_contractAddress != address(0), "Invalid address");
        require(_chainId != 0, "Invalid chainId");

        bytes32 deploymentId = _computeDeploymentId(_chainId, _contractAddress, _version);
        require(deployments[deploymentId].chainId == 0, "Deployment exists");

        deployments[deploymentId] = Deployment({
            chainId: _chainId,
            contractAddress: _contractAddress,
            version: _version
        });

        userDeploymentIds[msg.sender].push(deploymentId);
        emit DeploymentUpdated(msg.sender, _chainId, _contractAddress, _version, deploymentId);
    }

    function _computeDeploymentId(
        uint256 _chainId,
        address _contractAddress,
        string memory _version
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(_chainId, _contractAddress, _version));
    }

    function getUserDeploymentIds(address _user)
        external
        view
        returns (bytes32[] memory)
    {
        return userDeploymentIds[_user];
    }

    event DeploymentUpdated(
        address indexed user,
        uint256 indexed chainId,
        address contractAddress,
        string version,
        bytes32 deploymentId
    );
}
