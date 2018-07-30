var Marketplace = artifacts.require("./Marketplace.sol");
var Ownable = artifacts.require("./Ownable.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var ProductLibrary = artifacts.require("./ProductLibrary.sol");

module.exports = function(deployer) {
  deployer.deploy(Ownable);
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, ProductLibrary);
  deployer.deploy(ProductLibrary);

  deployer.link(SafeMath, Marketplace);
  deployer.link(ProductLibrary, Marketplace);
  deployer.deploy(Marketplace);
};
