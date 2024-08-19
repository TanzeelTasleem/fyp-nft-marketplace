// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";



contract MyToken is ERC1155Supply, Pausable{

    uint256 public tokenId = 0;
    address[] public owners;

     
    string public name;
    string public symbol;

    struct collectionInfo {
        string name;
        uint256[] royaltyPercentage;
        address[] royaltyHolder;
    }

    // id => details
    mapping (string => collectionInfo) public nftCollectionDetails;

    mapping (uint256 => string) public nftCollectionRecord;

    // tokenId = uri
    mapping (uint256 => string) private _tokenURIs;


    constructor(string memory _name,string memory _symbol) ERC1155("abc.com") {
    owners.push(msg.sender);
    name = _name;
    symbol = _symbol;
    }

    function _isOwner (address user) view public returns(bool){
         for (uint256 i = 0; i <owners.length; i++){

            if (owners[i] == user){
                return true;
            }
       }

       return false;
    }

       modifier onlyOwner() {
       
       bool checkOwner = _isOwner(msg.sender);
        require (checkOwner == true, "Only owners have access to this function");

        _;
       
    }

   
    function _setTokenUri(uint256 _tokenId, string memory _tokenURI) private {
         _tokenURIs[_tokenId] = _tokenURI; 
    } 

    
    function uri(uint256 _tokenId) override public view returns (string memory) { 
        return(_tokenURIs[_tokenId]); 
    } 


    function addOwner(address user) public onlyOwner {
        
         bool checkOwner = _isOwner(user);
        require (checkOwner == false, "This user is already an owner");

       owners.push(user);
    }

       function removeOwner(address user) public onlyOwner {
        
        require(owners.length > 1, "There has to be atleast one owner of the contract");

         for (uint256 i = 0; i <owners.length; i++){

            if (owners[i] == user){
                delete owners[i];
                owners[i] = owners[owners.length-1];
                owners.pop();
                return;
            }
       }

        revert("This user is not an owner");

    }

    function pause() public onlyOwner {
        _pause();
    }

    function mint(uint256 _amount, string memory _collectionId, string memory _tokenUri) public onlyOwner {

      require (bytes(nftCollectionDetails[_collectionId].name).length > 0, "Collection id not found");  
      _setTokenUri(tokenId,_tokenUri);
   _mint(msg.sender, tokenId, _amount, "");
   nftCollectionRecord[tokenId] = _collectionId;
   tokenId++;
    }


     function createCollection(string memory _collectionId, string memory _name, address[] memory _royaltyHolders, uint256[] memory _royalty) public onlyOwner {
   
         require(bytes(nftCollectionDetails[_collectionId].name).length == 0, "A collection with this id has already been made");
         require (_royaltyHolders.length > 0, "There should atleast be 1 royalty holder");
         require (_royalty.length <=10,"There cannot be more than 10 royalty holders");
        require ( _royaltyHolders.length == _royalty.length, "The length of input royalty and royalty holders should match");

        uint256 totalRoyalty =0;
        for (uint256 i=0; i<_royalty.length; i++){
            totalRoyalty += _royalty[i];
        }
        require(totalRoyalty <= 10, "Royalty should be between 0 and 10 %");


        nftCollectionDetails[_collectionId] = collectionInfo(_name,_royalty,_royaltyHolders); 

    }

    function unpause() public onlyOwner {
        _unpause();
    }


    function getRoyaltyHolders (string memory _collectionId) view public returns (address[] memory){


        collectionInfo memory info = nftCollectionDetails[_collectionId];

        return info.royaltyHolder;

    }


    function getRoyaltyPercentages (string memory _collectionId ) view public returns (uint256[] memory){


        collectionInfo memory info = nftCollectionDetails[_collectionId];

        return info.royaltyPercentage;

    }

}