// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

error NftMarketPlace__PriceMustBeAboveZero();
error NftMarketPlace__NotApprovedForMarketPlace();
error NftMarketPlace__AlreadyExisted(address nftAddress, uint256 tokenId);
error NftMarketPlace__NotOwner();
error NftMarketPlace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketPlace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketPlace__NoProceeds();
error NftMarketPlace__TransferFailed();

contract NftMarketPlace is ReentrancyGuard {
    // 1. 'listItem': List NFTS on the marketplace
    // 2. 'buyItems': Buy the NFTS
    // 3. 'cancelItem': Cancel a listing
    // 4. 'updateListing': Update price
    // 5. 'withdrawProceeds': Withdraw payments for my bought NFTS

    struct Listing {
        uint256 price;
        address seller;
    }

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCancelled(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId
    );
    ///////////////////////////////////////////////////
    // NFT Contract addres -> NFT TokenID -> Listing //
    //////////////////////////////////////////////////
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    // seller Address ->    Amount earned
    mapping(address => uint256) private s_proceeds;

    /////////////////////
    // Modifiers ////////
    /////////////////////
    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketPlace__AlreadyExisted(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NftMarketPlace__NotOwner();
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NftMarketPlace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    /////////////////////
    // Main functions ///
    /////////////////////

    /// @notice Method for listing your NFT on the marketplace
    /// @param nftAddress: Address of the NFT
    /// @param tokenId: token Id of the NFT
    /// @param price: The price of the NFT
    /// @dev Technically we could have the contract be the escrow for the Nft but this way people can still hold their NFTS when listed

    function listItems(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notListed(nftAddress, tokenId, msg.sender) isOwner(nftAddress, tokenId, msg.sender) {
        if (price <= 0) {
            revert NftMarketPlace__PriceMustBeAboveZero();
        }

        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketPlace__NotApprovedForMarketPlace();
        }

        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItems(address nftAddress, uint256 tokenId)
        external
        payable
        nonReentrant
        isListed(nftAddress, tokenId)
    {
        Listing memory listedItems = s_listings[nftAddress][tokenId];
        if (msg.value < listedItems.price) {
            revert NftMarketPlace__PriceNotMet(nftAddress, tokenId, listedItems.price);
        }
        s_proceeds[listedItems.seller] = s_proceeds[listedItems.seller] + msg.value;
        delete (s_listings[nftAddress][tokenId]);

        IERC721(nftAddress).safeTransferFrom(listedItems.seller, msg.sender, tokenId);
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItems.price);
    }

    function cancelListing(address nftAddress, uint256 tokenId) external isOwner(nftAddress, tokenId,msg.sender) isListed(nftAddress, tokenId){
        delete(s_listings[nftAddress][tokenId]);

        emit ItemCancelled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )external isListed(nftAddress, tokenId) isOwner(nftAddress, tokenId,msg.sender){
        s_listings[nftAddress][tokenId].price = newPrice;

        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if(proceeds <= 0 ){
            revert NftMarketPlace__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}('');
        if(!success){
            revert NftMarketPlace__TransferFailed();
        }
    }

    /////////////////////
    // getter functions ///
    /////////////////////

    function getListings(address nftAddress, uint256 tokenId) external view returns(Listing memory){
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns(uint256){
        return s_proceeds[seller];
    } 
}