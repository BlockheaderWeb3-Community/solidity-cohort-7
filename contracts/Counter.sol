// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ICounter {
    function setCount(uint256 _count) external;
    function increaseCountByOne() external;
    function getCount() external  view returns(uint256);

}

contract Counter is ICounter {
    uint256 public count;

    function setCount(uint256 _count) external {
        count = _count;
    }

    function increaseCountByOne() public {
        count += 1;
    }

    function getCount() public view returns(uint256) {
        return count;
    }
}


// contract F {
//     // Initializing interface IC
//    IC public _ic;
//     // Initializing the contract address 
//    address public contractCAddress;

//    constructor(address _contractCAddress) {
//     // Set the contract address to the state variable contract address
//     contractCAddress = _contractCAddress;
//     // Passing the contract address into interface using the address instance of another contract
//     _ic = IC(_contractCAddress);
//    }

//     function setCount(uint256 _count) public {
//         _ic.setCount(_count);
//     }

//     function getCount() public view returns(uint256) {
//         return _ic.getCount();
//     }
// }