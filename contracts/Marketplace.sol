pragma solidity 0.4.24;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./ProductLibrary.sol";

contract Marketplace is Ownable {
    using SafeMath for uint256;
    using ProductLibrary for ProductLibrary.Product;

    event LogProductBought(address indexed buyer, bytes32 indexed ID, uint256 quantity, uint256 total);
    event LogProductUpdated(bytes32 indexed ID, uint256 quantity);
    event LogProductAdded(bytes32 id, string name, uint256 price, uint256 quantity);
    event LogWithdrawal(uint256 quantity);

    mapping(bytes32 => ProductLibrary.Product) private products;
    bytes32[] private productIds;
    uint256 private balance;


    modifier productDoesNotExist(string name) {
        bytes32 id = ProductLibrary.getIdForName(name);
        require(products[id].id != id, "Product with that name already exists.");
        _;
    }

    modifier productExists(bytes32 ID) {
        require(products[ID].id == ID, "Product doesn't exist.");
        _;
    }

    modifier enoughQuantity(bytes32 ID, uint256 quantity) {
        require(products[ID].quantity > 0, "Product out of stock.");
        require(products[ID].quantity >= quantity, "Insufficient quantity.");
        _;
    }

    modifier enoughFunds(bytes32 ID, uint256 quantity) {
        require(products[ID].price.mul(quantity) <= msg.value, "Insufficient funds provided.");
        _;
    }

    modifier positiveBalance {
        require(balance > 0, "Balance is zero.");
        _;
    }

    function buy(bytes32 ID, uint256 quantity)
        public
        payable
        productExists(ID)
        enoughQuantity(ID, quantity)
        enoughFunds(ID, quantity)
    {
        products[ID].buyProduct(quantity);
        balance = balance.add(msg.value);

        emit LogProductBought(msg.sender, ID, quantity, msg.value);
    }

    function update(bytes32 ID, uint newQuantity)
        public
        onlyOwner
        productExists(ID)
    {
        products[ID].updateProduct(newQuantity);

        emit LogProductUpdated(ID, newQuantity);
    }

    //creates a new product and returns its ID
    function newProduct(string name, uint price, uint quantity)
        public
        onlyOwner
        productDoesNotExist(name)
        returns(bytes32 ID)
    {
        ProductLibrary.Product memory product = ProductLibrary.createProduct(name, price, quantity);
        ID = product.id;

        products[ID] = product;
        productIds.push(ID);

        emit LogProductAdded(ID, name, price, quantity);
    }

    function getProduct(bytes32 ID)
        public
        view
        productExists(ID)
        returns(string name, uint price, uint quantity)
    {
        ProductLibrary.Product memory product = products[ID];
        return (product.name, product.price, product.quantity);
    }

    function getProducts()
        public
        view
        returns(bytes32[])
    {
        return productIds;
    }

    //function for the optional requirement for a withdraw function. Implement if you want.
    function withdraw()
        public
        onlyOwner
        positiveBalance
    {

        uint256 _balance = balance;

        owner.transfer(_balance);
        balance = 0;

        emit LogWithdrawal(_balance);
    }

    function getBalance()
      external
      view
      onlyOwner
      returns(uint256)
    {
        return balance;
    }
}
