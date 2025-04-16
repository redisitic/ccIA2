// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FileRegistry {
    struct File {
        string version;
        uint256 timestamp;
        string hash;
        address owner;
    }

    mapping(string => File) private files;

    event FileStored(string fileId, string version, uint256 timestamp, string fileHash, address indexed owner);

    function storeFile(
        string calldata fileId,
        string calldata version,
        string calldata fileHash
    ) external {
        require(bytes(files[fileId].hash).length == 0, "File already exists");
        files[fileId] = File({
            version: version,
            timestamp: block.timestamp,
            hash: fileHash,
            owner: msg.sender
        });
        emit FileStored(fileId, version, block.timestamp, fileHash, msg.sender);
    }

    function getFile(string calldata fileId)
        external
        view
        returns (
            string memory version,
            uint256 timestamp,
            string memory fileHash,
            address owner
        )
    {
        File memory f = files[fileId];
        return (f.version, f.timestamp, f.hash, f.owner);
    }
}