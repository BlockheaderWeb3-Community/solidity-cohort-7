// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ICounter{
    function setCount(uint256 _count) external;

    function getCount() external  view returns(uint256);

    function increaseCountByOne() external;
}

contract Counter is ICounter {
    uint256 public count;

    function setCount(uint256 _count) public {
        count = _count;
    }

    function getCount() public view returns(uint256) {
        return count;
    }

    function increaseCountByOne() public {
        count+=1;
    }
}

// contract F {
//     // Initializing interface IC
//    ICounter public _ic;
//     // Initializing the contract address 
//    address public contractCAddress;

//    constructor(address _contractCAddress) {
//     // Set the contract address to the state variable contract address
//     contractCAddress = _contractCAddress;
//     // Passing the contract address into interface using the address instance of another contract
//     _ic = ICounter(_contractCAddress);
//    }

//     function setCount(uint256 _count) public {
//         _ic.setCount(_count);
//     }

//     function getCount() public view returns(uint256) {
//         return _ic.getCount();
//     }

//     function increaseCountByOne() public {
//         return _ic.increaseCountByOne();
//     }
// }