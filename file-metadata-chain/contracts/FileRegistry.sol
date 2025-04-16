// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileRegistry {
    struct File {
        string version;
        uint256 timestamp;
        string hash;
        address owner;
    }

    mapping(string => File) private files;  // Use a key like file ID or encrypted filename

    event FileStored(string fileKey, string version, uint256 timestamp, string hash, address indexed owner);

    function storeFile(string memory fileKey, string memory version, string memory hash) public {
        require(bytes(files[fileKey].hash).length == 0, "File already exists");

        files[fileKey] = File({
            version: version,
            timestamp: block.timestamp,
            hash: hash,
            owner: msg.sender
        });

        emit FileStored(fileKey, version, block.timestamp, hash, msg.sender);
    }

    function getFile(string memory fileKey) public view returns (string memory version, uint256 timestamp, string memory hash, address owner) {
        File memory f = files[fileKey];
        return (f.version, f.timestamp, f.hash, f.owner);
    }
}