// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GenLayerDiceUnlimited {
    event DiceRolled(address indexed player, uint8 roll, uint256 timestamp);

    function rollDice() external returns (uint8) {
        uint8 roll = uint8(
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        msg.sender,
                        block.prevrandao
                    )
                )
            ) % 6 + 1
        );

        emit DiceRolled(msg.sender, roll, block.timestamp);
        return roll;
    }
}

