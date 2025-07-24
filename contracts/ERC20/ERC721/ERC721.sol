// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC165 {
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

interface IERC721 is IERC165 {
    function balanceOf(address owner) external view returns (uint256 balance);

    function ownerOf(uint256 tokenId) external view returns (address owner);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external;

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function approve(address to, uint256 tokenId) external;

    function getApproved(uint256 tokenId) external view returns (address owner);

    function setApprovalForAll(address operator, bool _approved) external;

    function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool);
}

interface IERC721Receiver {
    function onERC721Receiver(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

contract ERC721{
    event Transfer(address indexed from, address indexed to, uint indexed id);
    event Approval(address indexed owner, address indexed approved, uint indexed id);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    mapping (uint => address) internal _ownerOf;
    mapping (address => uint) internal _balanceOf;
    mapping (uint => address) internal _approvals;
    mapping (address owner => mapping(address operator => bool)) internal _isApprovedForAll;

    function supportsInterface(bytes4 interfaceId) external pure returns (bool){
        return interfaceId == type(IERC721).interfaceId || interfaceId == type(IERC165).interfaceId;
    }

    function ownerOf(uint id) external view returns (address owner){
        owner = _ownerOf[id];
        require(owner != address(0), "Token does not exist");
    }


    function balanceOf(address owner) external view returns (uint){
        require(owner != address(0), "zero address");
        return _balanceOf[owner];
    }

    function setApprovalForAll(address operator, bool approved) external {
        _isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function Approved(address spender, uint id) external {
        address owner = _ownerOf[id];
        require(msg.sender == owner || _isApprovedForAll[owner][msg.sender], "not Approved");
        _approvals[id]= spender;
        emit Approval(owner, spender, id);
    }

    function getApproved(uint id) external view returns (address){
        require(_ownerOf[id] != address(0), "token does not exist");
        return _approvals[id];
    }

     function _isApprovedOrOwner(address owner, address spender, uint id) internal view returns (bool){
         return (spender == owner || _isApprovedForAll[owner][spender] || spender == _approvals[id]);
        
     }

     function transferFrom(address from, address to, uint id) public{
         require(from == _ownerOf[id], "from not owner");
        require(to != address(0), "transfer to zero address");
         require(_isApprovedOrOwner(from, msg.sender, id), "not authorized");

         _balanceOf[from]--;
         _balanceOf[to]++;
         _ownerOf[id] = to;

         delete _approvals[id];
         emit Transfer(from, to, id);
     }

     function _burn(uint id) internal {
        address owner = _ownerOf[id];
        require(owner != address(0), "not minted");

        _balanceOf[owner] -= 1;

        delete _ownerOf[id];
        delete _approvals[id];
     }

     function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external {
        transferFrom (from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external{
        transferFrom(from, to, tokenId);

    if (to.code.length > 0) {
        require(
            IERC721Receiver(to).onERC721Receiver(msg.sender, from, tokenId, data) ==
                IERC721Receiver.onERC721Receiver.selector,
            "unsafe recipient"
        );
    }

    }

     function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool){
            return _isApprovedForAll[owner][operator];
        }
     
}