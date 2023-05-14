// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./IERC20.sol";

contract ERC20 is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply = 10000 ether;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    function _mint(address _to, uint256 _value) internal {
        _balances[_to] += _value;

        emit Transfer(address(0), _to, _value);
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return _balances[_owner];
    }

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        require(_balances[msg.sender] >= _value, "Insufficient balance.");

        _transfer(_to, _value);
        
        emit Transfer(msg.sender, _to, _value);        

        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external returns (bool success) {
        require(
            _allowances[_from][msg.sender] >= _value,
            "Insufficient balance."
        );

        _transfer(_to, _value);

        emit Transfer(_from, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        _allowances[msg.sender][_spender] += _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function _transfer(address _to, uint256 _value) internal {
        _balances[msg.sender] -= _value;
        _balances[_to] += _value;
    }

    function allowance(address _owner, address _spender) external view returns (uint256 remaining) {
        return _allowances[_owner][_spender];
    }
}
