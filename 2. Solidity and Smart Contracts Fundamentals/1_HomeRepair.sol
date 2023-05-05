// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract HomeRepairService {
    address payable owner = payable(0x5B38Da6a701c568545dCfcB03FcB875f56beddC4);    
    address payable repearer = payable(0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678);
    address administrator = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;
    address[] auditors = [
        0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db, 
        0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB,
        0x617F2E2fD72FD9D5503197092aC168c91465E7f2,
        0x17F6AD8Ef982297579C203069C1DbfFE4348c372
    ];    

    uint256 currentId;

    mapping(uint256 => mapping(address => string)) requests;
    mapping(uint256 => uint256) acceptedRepairs;
    mapping(uint256 => bool) isPaid;
    mapping(uint256 => bool) completedRepairs;
    mapping(uint256 => address[]) audits;
    mapping(uint256 => uint256) lastAuditDates;

    // 1. Add a repair request
    function addRepairRequest(string memory description) public {
        currentId++;
        requests[currentId][msg.sender] = description;
    }

    // 2. Accept a repair request
    function acceptRepair(uint256 id, uint256 amount) public {
        require(administrator == msg.sender);
        acceptedRepairs[id] = amount;
    }

    // 3. Add payment
    function addPayment(uint256 id) public payable {
        require(acceptedRepairs[id] > 0, "The repair is not aproved.");
        isPaid[id] = true;
        payable(owner).transfer(acceptedRepairs[id]);
    }

    // 4. Confirm a repair request
    function confirmRepair(uint256 id) public {
        require(administrator == msg.sender);
        completedRepairs[id] = true;
    }

    // 5. Verify that the job is done
    function verifyJob(uint256 id) public payable {
        bool isAuditor;
        for (uint256 i = 0; i < auditors.length; i++) 
        {
            if (msg.sender == auditors[i]) {
                isAuditor = true;
                break;
            }
            else {
                revert("Sender is not an auditor.");
            }
        }

        if (audits[id].length == auditors.length) {
            revert("This reapair is already audited.");
        }

        for (uint256 i = 0; i < audits[id].length; i++) 
        {
            if (msg.sender == audits[id][i]) {
                revert("This repair is already audited by this sender.");
            }
        }

        audits[id].push(msg.sender);
        lastAuditDates[id] = block.timestamp;      
    }

    // 6. Execute a repair request
    function executeRepairRequest(uint256 id) public payable  {
        require(audits[id].length >= 2);
        repearer.transfer(msg.value);
    }

    // 7. Money-back
    function requestRefund(uint256 id) public payable {
        if (block.timestamp - lastAuditDates[id] > 30) {
            payable(msg.sender).transfer(acceptedRepairs[id]);
        }
    }
}
