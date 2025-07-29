

// interface ICounter {
//     function setCount(uint256 _count) external;
//     function getCount() external  view returns(uint256);
//     function decreaseCountByOne() external;
//     function resetCount() external returns(uint256);

// }

// contract CounterV2 is ICounter {

//     uint public count;
//     address public caller;

//     constructor(address _caller){
//         caller = _caller;
//     }

//     function setCount(uint256 _count) external {
//         require(count <= 0, "Count already has input value");
//         require(caller == msg.sender, "Wrong caller");
//         count = _count;
//     }

//     function getCount() external view returns(uint256){
//         return count;
//     }

//      function increaseCountByOne() public {
//         require(caller == msg.sender, "Wrong caller");
//         require(count >= 0, "Count value is indefinite");
//         count += 1;
//     }

//     function decreaseCountByOne() public {
//         count -= 1;
//     }

//     function resetCount () external returns (uint){
//         require (caller == msg.sender, "Wrong caller");
//         require(count > 0, "Count value is empty");
//         count = 0;
//         return count;
//     }

// }

// contract CounterV2Caller {

//     ICounter public ic;
//     address public contractAddress;

//     constructor(address _contractAddress){
//         contractAddress = _contractAddress;
//         ic = ICounter(_contractAddress);
//     }

//     function decreaseCountByOne() public {
//         ic.decreaseCountByOne();
//     }
// }


// SPDX-License-Identifier: MIT

pragma solidity >= 0.7.0 < 0.9.0;

interface ICounterV2{
    function setCount(uint256 _count) external;
    function getCount() external  view returns(uint256);
    function resetCount() external;
    function decrementCount() external;
}

contract CounterV2 is ICounterV2{
    address public owner;
    uint256 public count;

    constructor(){
        owner = msg.sender;
    }

    function setCount(uint256 _count) external {
        require(msg.sender == owner, "Unauthorized Caller");
        require(_count > 0, "Cannot pass zero value as argument"); 

        count = _count;
    }

    function getCount() external view returns(uint256) {
        return count;
    }

    function resetCount() external {
        require(msg.sender == owner, "Unauthorized Caller");
        if (count > 0) {
            count = 0;
        }
    }

    function decrementCount() external {
        count -= 1;
    }
}

contract CounterV2Caller {
    ICounterV2 public _iCounterV2;
    address public contractCounterV2Address;

   constructor(address _contractCounterV2Address) {
    contractCounterV2Address = _contractCounterV2Address;
    _iCounterV2 = ICounterV2(_contractCounterV2Address);
   }

    function callDecrement() external {
        _iCounterV2.decrementCount();
    }
}


