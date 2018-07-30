pragma solidity 0.4.24;

import "./SafeMath.sol";

library ProductLibrary {
    using SafeMath for uint256;

    struct Product {
        bytes32 id;
        string name;
        uint price; //in wei
        uint quantity;
    }

    function createProduct(string name, uint256 price, uint256 quantity) internal pure returns(Product) {
        require(price > 0, "Price must be positive and different than 0!");
        return Product({ id: getIdForName(name), name: name, price: price, quantity: quantity});
    }

    function buyProduct(Product storage self, uint256 quantity) internal {
        self.quantity = self.quantity.sub(quantity);
    }

    function updateProduct(Product storage self, uint256 quantity) internal {
        self.quantity = quantity;
    }

    function getIdForName(string name) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(name));
    }
}
