var Marketplace = artifacts.require("./Marketplace.sol");
var crypto = require("crypto");

contract('Marketplace', function(accounts) {
  let _owner = accounts[0];
  let buyer = accounts[1];

  let productPrice = 10000000000;
  let productQuantity = 10;
  let purchaseQuantity = 5;

  function extractProductId(logs) {
    for (var i = 0; i < logs.length; i++) {
      var log = logs[i];

      if (log.event == "LogProductAdded") {
        // We found the event!
        return log.args.id;
      }
    }
  }

  it("should initialize the owner as the the first address", function() {
    return Marketplace.deployed().then(function(instance) {
      marketPlace = instance;
      return instance.owner.call();
    }).then(function(owner) {
      assert.equal(owner, _owner, "Owner is not assigned correctly!");
    });
  });

  it("should create new product", function() {
    var marketPlace;
    var productId;
    let productName = crypto.randomBytes(20).toString('hex');

    return Marketplace.deployed().then(function(instance) {
      marketPlace = instance;
      return instance.newProduct(productName, productPrice, productQuantity, {from: _owner});
    }).then(function(result) {
      // We can loop through result.logs to see if we triggered the LogProductAdded event.
      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];

        if (log.event == "LogProductAdded") {
          // We found the event!
          productId = log.args.id;
          break;
        }
      }

      assert(null != productId);
      return marketPlace.getProducts.call();
    }).then(function(productIds) {
      assert.equal(1, productIds.length);
      return marketPlace.getProduct.call(productId);
    }).then(function(e) {
      assert.equal(productName, e[0], "Product name is different.");
      assert.equal(productPrice, e[1].toNumber(), "Product price is different.");
      assert.equal(productQuantity, e[2].toNumber(), "Product quantity is different.");
    });
  });

  it("shouldn't create duplicated product", function() {
    var marketPlace;
    let productName = crypto.randomBytes(20).toString('hex');

    return Marketplace.deployed().then(function(instance) {
      marketPlace = instance;
      return instance.newProduct(productName, productPrice, productQuantity, {from: _owner});
    }).then(function(productId) {
      return marketPlace.newProduct(productName, productPrice, productQuantity, {from: _owner});
    }).then(function(productId) {
      assert(false, "Should have thrown an exception!");
    }).catch(function(error) {
      assert.equal("Error: VM Exception while processing transaction: revert", error, "Different exception thrown.");
    });
  });

  it("shouldn't able to buy product which doesn't exists", function() {
    let productName = crypto.randomBytes(20).toString('hex');

    return Marketplace.deployed().then(function(instance) {
      return instance.buy.sendTransaction(productName, 1, {from: buyer, gas: 30000, value: web3.toWei(1, "ether")});
    }).then(function(productId) {
      assert(false, "Should have thrown an exception!");
    }).catch(function(error) {
      assert.equal("Error: VM Exception while processing transaction: revert", error, "Different exception thrown.");
    });
  });

  it("should be able to buy product which exists", function() {
    var marketPlace;
    var productId;
    let productName = crypto.randomBytes(20).toString('hex');

    return Marketplace.deployed().then(function(instance) {
      marketPlace = instance;
      return marketPlace.newProduct(productName, productPrice, productQuantity, {from: _owner});
    }).then(function(result) {
      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];

        if (log.event == "LogProductAdded") {
          // We found the event!
          productId = log.args.id;
          break;
        }
      }

      assert(null != productId);
      return marketPlace.buy.sendTransaction(productId, purchaseQuantity, {from: buyer, gas: 100000, value: web3.toWei(1, "ether")});
    }).then(function() {
      return marketPlace.getProduct.call(productId);
    }).then(function(e) {
      assert.equal(purchaseQuantity, e[2].toNumber(), "Product quantity is different.");
    });
  });

  it("shouldn't be able to buy product if quantity insufficient", function() {
    var marketPlace;
    var productId;
    let productName = crypto.randomBytes(20).toString('hex');

    return Marketplace.deployed().then(function(instance) {
      marketPlace = instance;
      return marketPlace.newProduct(productName, productPrice, productQuantity, {from: _owner});
    }).then(function(result) {
      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];

        if (log.event == "LogProductAdded") {
          // We found the event!
          productId = log.args.id;
          break;
        }
      }

      assert(null != productId);
      return marketPlace.buy.sendTransaction(productId, productQuantity+1, {from: buyer, gas: 100000, value: web3.toWei(1, "ether")});
    }).then(function() {
      assert(false, "Should have thrown an exception!");
    }).catch(function(error) {
      assert.equal("Error: VM Exception while processing transaction: revert", error, "Different exception thrown.");
    });
  });

  it("shouldn't be able to buy product if no funds provided", function() {
    var marketPlace;
    var productId;
    let productName = crypto.randomBytes(20).toString('hex');

    return Marketplace.deployed().then(function(instance) {
      marketPlace = instance;
      return marketPlace.newProduct(productName, productPrice, productQuantity, {from: _owner});
    }).then(function(result) {
      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];

        if (log.event == "LogProductAdded") {
          // We found the event!
          productId = log.args.id;
          break;
        }
      }

      assert(null != productId);
      return marketPlace.buy.sendTransaction(productId, productQuantity, {from: buyer, gas: 100000});
    }).then(function() {
      assert(false, "Should have thrown an exception!");
    }).catch(function(error) {
      assert.equal("Error: VM Exception while processing transaction: revert", error, "Different exception thrown.");
    });
  });

  it("shouldn't be able to buy product if funds insufficient", function() {
    var marketPlace;
    var productId;
    let productName = crypto.randomBytes(20).toString('hex');

    return Marketplace.deployed().then(function(instance) {
      marketPlace = instance;
      return marketPlace.newProduct(productName, productPrice, productQuantity, {from: _owner});
    }).then(function(result) {
      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];

        if (log.event == "LogProductAdded") {
          // We found the event!
          productId = log.args.id;
          break;
        }
      }

      assert(null != productId);
      return marketPlace.buy.sendTransaction(productId, productQuantity+1, {from: buyer, gas: 100000, value: web3.toWei(0.5, "ether")});
    }).then(function() {
      assert(false, "Should have thrown an exception!");
    }).catch(function(error) {
      assert.equal("Error: VM Exception while processing transaction: revert", error, "Different exception thrown.");
    });
  });

  it("only the owner can update a Product", function() {
    var marketPlace;
    var productId;
    let productName = crypto.randomBytes(20).toString('hex');

    return Marketplace.deployed().then(function(instance) {
      marketPlace = instance;
      return marketPlace.newProduct(productName, productPrice, productQuantity, {from: _owner});
    }).then(function(result) {
      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];

        if (log.event == "LogProductAdded") {
          // We found the event!
          productId = log.args.id;
          break;
        }
      }

      assert(null != productId);
      return marketPlace.update(productId, productQuantity+1, {from: buyer});
    }).then(function() {
      assert(false, "Should have thrown an exception!");
    }).catch(function(error) {
      assert.equal("Error: VM Exception while processing transaction: revert", error, "Different exception thrown.");
    });
  });

  it("only the owner can update a Product", function() {
    var marketPlace;
    var productId;
    var newQuantity = productQuantity + 1000000000;
    let productName = crypto.randomBytes(20).toString('hex');

    return Marketplace.deployed().then(function(instance) {
      marketPlace = instance;
      return marketPlace.newProduct(productName, productPrice, productQuantity, {from: _owner});
    }).then(function(result) {
      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];

        if (log.event == "LogProductAdded") {
          // We found the event!
          productId = log.args.id;
          break;
        }
      }

      assert(null != productId);
      return marketPlace.update(productId, newQuantity, {from: _owner});
    }).then(function() {
      return marketPlace.getProduct.call(productId);
    }).then(function(e) {
      assert.equal(newQuantity, e[2].toNumber(), "Product quantity is different.");
    });
  });

  it("owner should be able to withdraw funds", function() {
    let marketPlace;
    let productId;
    let initialOwnerBalance;
    let productName = crypto.randomBytes(20).toString('hex');

    return Marketplace.deployed().then(function(instance) {
      marketPlace = instance;
      return marketPlace.withdraw({from: _owner});
    }).then(function() {

      return marketPlace.newProduct(productName, productPrice, productQuantity, {from: _owner});
    }).then(function(result) {
      productId = extractProductId(result.logs);

      assert(null != productId);
      return marketPlace.buy.sendTransaction(productId, purchaseQuantity, {from: buyer, gas: 100000, value: web3.toWei(1, "ether")});
    }).then(function() {
      initialOwnerBalance = web3.eth.getBalance(_owner).toNumber();
      console.log("Initial Owner balance: " + initialOwnerBalance);
      return marketPlace.withdraw({from: _owner});
    }).then(async(result) => {
      let hash = result.tx;
      // console.log("TX Hash: " + hash);
      let tx = await web3.eth.getTransaction(hash);
      let receipt = await web3.eth.getTransactionReceipt(hash);
      let gasCost = tx.gasPrice.mul(receipt.gasUsed);

      console.log("gasCost: " + gasCost);

      let balanceAfterWithdrawal = web3.fromWei(web3.eth.getBalance(_owner).toNumber());
      let etherInWei = parseInt(web3.toWei(1, "ether"));
      let expectedFinalBalance = web3.fromWei(etherInWei + initialOwnerBalance - gasCost);
      // console.log("Calc: " + web3.fromWei((initialOwnerBalance + etherInWei).toString(), 'ether'));
      // console.log("etherInWei: " + etherInWei);
      console.log("Final Owner Balance: " + balanceAfterWithdrawal);
      console.log("Expected Final Balance: " + expectedFinalBalance);
      assert.equal(expectedFinalBalance, balanceAfterWithdrawal, "Final Balance is incorrect.");
    });
  });

  it("owner shouldn't be able to withdraw when no funds available", function() {
    return Marketplace.deployed().then(function(instance) {
      return instance.withdraw({from: _owner});
    }).then(function() {
      assert(false, "Should have thrown an exception!");
    }).catch(function(error) {
      assert.equal("Error: VM Exception while processing transaction: revert", error, "Different exception thrown.");
    });
  });

  it("everyone different than the owner shouldn't be able to withdraw funds", function() {
    let marketPlace;
    let productId;
    let initialOwnerBalance;
    let productName = crypto.randomBytes(20).toString('hex');

    return Marketplace.deployed().then(function(instance) {
      marketPlace = instance;
      return marketPlace.withdraw({from: _owner});
    }).then(function() {
      return marketPlace.newProduct(productName, productPrice, productQuantity, {from: _owner});
    }).then(function(result) {
      productId = extractProductId(result.logs);
      assert(null != productId);
      return marketPlace.buy.sendTransaction(productId, purchaseQuantity, {from: buyer, gas: 100000, value: web3.toWei(1, "ether")});
    }).then(function() {
      return instance.withdraw({from: buyer});
    }).then(function() {
      assert(false, "Should have thrown an exception!");
    }).catch(function(error) {
      assert.equal("Error: VM Exception while processing transaction: revert", error, "Different exception thrown.");
    });
  });
});
