//this function will be called when the whole page is loaded
window.onload = function () {
  if (typeof web3 === 'undefined') {
    //if there is no web3 variable
    displayMessage("Error! Are you sure that you are using metamask?");
  } else {
    displayMessage("Welcome to our DAPP!");
    init();
  }

  updateTotal();
}

var contractInstance;

var abi = [
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "ID",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "quantity",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "total",
        "type": "uint256"
      }
    ],
    "name": "LogProductBought",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "ID",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "quantity",
        "type": "uint256"
      }
    ],
    "name": "LogProductUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "id",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "price",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "quantity",
        "type": "uint256"
      }
    ],
    "name": "LogProductAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "quantity",
        "type": "uint256"
      }
    ],
    "name": "LogWithdrawal",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "ID",
        "type": "bytes32"
      },
      {
        "name": "quantity",
        "type": "uint256"
      }
    ],
    "name": "buy",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "ID",
        "type": "bytes32"
      },
      {
        "name": "newQuantity",
        "type": "uint256"
      }
    ],
    "name": "update",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "name",
        "type": "string"
      },
      {
        "name": "price",
        "type": "uint256"
      },
      {
        "name": "quantity",
        "type": "uint256"
      }
    ],
    "name": "newProduct",
    "outputs": [
      {
        "name": "ID",
        "type": "bytes32"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "ID",
        "type": "bytes32"
      }
    ],
    "name": "getProduct",
    "outputs": [
      {
        "name": "name",
        "type": "string"
      },
      {
        "name": "price",
        "type": "uint256"
      },
      {
        "name": "quantity",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getProducts",
    "outputs": [
      {
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

//change this after the contract is published
let contractAddress = "0x2e95d73f81ec3dc8721857252a96d54ecdb0a1f2";
let acc;

function init() {
  let Contract = web3.eth.contract(abi);
  contractInstance = Contract.at(contractAddress);

  let productAddedEvent = contractInstance.LogProductAdded();
  productAddedEvent.watch(function (error, result) {
    if (!error) {
      getProductDataAndCreateHtml(result.args.id, $("#productInfo"));
      console.log("Incoming LogProductAdded event: " + result.args);
    } else {
      console.log("Error watching LogProductAdded event: " + error);
    }
  });

  let productUpdatedEvent = contractInstance.LogProductUpdated();
  productUpdatedEvent.watch(function (error, result) {
    if (!error) {
      updateProductQuantity(result.args.ID, result.args.quantity.toNumber());
      console.log("Incoming LogProductUpdated event: " + result.args);
    } else {
      console.log("Error watching LogProductUpdated event: " + error);
    }
  });

  let productPurchasedEvent = contractInstance.LogProductBought();
  productPurchasedEvent.watch(function (error, result) {
    if (!error) {
      let currentQuantity = parseInt($("#productQuantity_" + result.args.ID).text());
      updateProductQuantity(result.args.ID, currentQuantity - result.args.quantity.toNumber());

      let currentTurnOver = parseInt($("#turnover").text());
      $("#turnover").html(currentTurnOver + result.args.total.toNumber());
      console.log("Incoming LogProductBought event: " + result.args);
    } else {
      console.log("Error watching LogProductBought event: " + error);
    }
  });

  let withdrawalEvent = contractInstance.LogWithdrawal();
  withdrawalEvent.watch(function (error, result) {
    if (!error) {
      $("#turnover").html(0);
      console.log("Incoming LogWithdrawal event: " + result.args);
    } else {
      console.log("Error watching LogWithdrawal event: " + error);
    }
  });

  updateAccount();
  showProducts();
}

function updateAccount() {
  //in metamask, the accounts array is of size 1 and only contains the currently selected account. The user can select a different account and so we need to update our account variable
  acc = getCurrentAccount();
  showOwnerContainer(acc);
}

function getCurrentAccount() {
  return web3.eth.accounts[0];
}

function showOwnerContainer(acc) {
  contractInstance.owner(function (error, result) {
    if (!error) {
      if (result === getCurrentAccount()) {
        $("#ownerContainer").show();
        getOwnerCurrentBalance();
      } else {
        $("#ownerContainer").hide();
      }
    } else {
      console.log("Error obtaining owner: " + error);
    }
  });
}

function getOwnerCurrentBalance() {
  contractInstance.getBalance.call({"from": acc}, function (err, balance) {
    if (!err) {
      let _balance = balance.toNumber();
      $("#turnover").html(_balance);
      console.log(_balance);
    } else {
      displayMessage("Something went wrong. Are you sure that you are the current owner?");
    }
  });
}

function updateProductQuantity(productId, newQuantity) {
  let productQtyContainer = $("#productQuantity_" + productId);
  productQtyContainer.html(newQuantity);
}

function displayMessage(message) {
  let el = document.getElementById("message");
  el.innerHTML = message;
}

function getTextInput(elId) {
  let el = document.getElementById(elId);

  return el.value;
}

function onCreateProductPressed() {
  updateAccount();

  let productName = getTextInput("newProductName");
  let productPrice = getTextInput("newProductPrice");
  let productQuantity = getTextInput("newProductQuantity");

  contractInstance.newProduct(productName, productPrice, productQuantity, {"from": acc}, function (err, res) {
    if (!err) {
      console.log(res);
      displayMessage("Success! Transaction hash: " + res);
    } else {
      displayMessage("Something went wrong. Are you sure that you are the current owner?");
    }
  });
}

function onUpdateProductPressed() {
  updateAccount();

  let productIdToUpdate = getTextInput("productIdToUpdate");
  let updatedQuantity = getTextInput("updatedQuantity");

  contractInstance.update(productIdToUpdate, updatedQuantity, {"from": acc}, function (err, res) {
    if (!err) {
      displayMessage("Product Updated Successfully!");
    } else {
      displayMessage("Something went wrong. Are you sure that you are the current owner?");
    }
  });
}

function onGetProductsPressed() {
  updateAccount();

  contractInstance.getProducts({"from": acc}, function (err, res) {
    if (!err) {
      let productData = $("#productData");
      productData.html("");

      let productIds = res.valueOf();

      for (let i = 0; i < productIds.length; i++) {
        showProductWithId(productIds[i], productData);
      }
    } else {
      displayMessage("Something went wrong. Are you sure that you are the current owner?");
    }
  });
}

function showProductWithId(productId, productData) {
  contractInstance.getProduct(productId, {"from": acc}, function (err, res) {
    if (!err) {
      let productInfo = res.valueOf();

      let html = "<tr><td>" + productInfo[0] + "</td>";
      html += "<td>" + productInfo[1].toNumber() + "</td>";
      html += '<td>' + productInfo[2].toNumber() + "</td>";
      html += "<td>" + productId + "</td></tr>";
      productData.append(html);
    } else {
      displayMessage("Something went wrong during displaying Product Info for Owner");
    }
  });
}

function onGetProductByIdPressed() {
  updateAccount();

  let productId = getTextInput("productId");

  contractInstance.getProduct(productId, {"from": acc}, function (err, res) {
    if (!err) {
      let productInfo = res.valueOf();

      document.getElementById("productName").innerHTML = productInfo[0];
      document.getElementById("productPrice").innerHTML = productInfo[1];
      document.getElementById("productQuantity").innerHTML = productInfo[2];
    } else {
      displayMessage("Something went wrong. Are you sure that you are the current owner?");
    }
  });
}

function showProducts() {
  contractInstance.getProducts({"from": acc}, function (err, res) {
    if (!err) {
      let productInfo = $("#productInfo")
      productInfo.html("");

      let productIds = res.valueOf();

      for (let i = 0; i < productIds.length; i++) {
        getProductDataAndCreateHtml(productIds[i], productInfo);
      }
    } else {
      displayMessage("Something went wrong. Are you sure that you are the current owner?");
    }
  });
}

function getProductDataAndCreateHtml(productId, el) {
  console.log("Getting Product Data for ID: [" + productId + "]");

  contractInstance.getProduct(productId, {"from": acc}, function (err, res) {
    if (!err) {

      if ($("#pr_" + productId).length == 0) {
        let productData = res.valueOf();
        let html = '<tr id="pr_' + productId + '">';
        html += "<td>" + productData[0] + "</td>";
        html += '<td class="rightAlign">' + productData[1].toNumber() + "</td>";
        html += '<td id="productQuantity_' + productId + '">' + productData[2].toNumber() + "</td>";
        html += '<td><input type="button" value="Add To Cart" onclick="addProductToCart(\'' + productId + '\')"/></td>';
        html += "</tr>";
        el.append(html)
        console.log("Product data: " + productData + " added to table.");
      }
    } else {
      displayMessage("Something went wrong. Are you sure that you are the current owner?");
    }
  });
}

function addProductToCart(productId) {

  contractInstance.getProduct(productId, {"from": acc}, function (err, res) {
    if (!err) {
      let productInfo = res.valueOf();
      let quantity = productInfo[2];

      let productInCart = $("#" + productId);

      if (quantity > 0 && productInCart.length == 0) {
        let cart = $("#cart");
        let html = '<tr id="' + productId + '"><td>' + productInfo[0] + "</td>";
        html += '<td><input id="quantity_' + productId + '" type="text" value="1" onchange="updateProductTotal(this, \'' + productId + '\', ' + productInfo[1].toNumber() + ')"/></td>';
        html += '<td id="total_' + productId + '" class="rightAlign">' + 1 * productInfo[1].toNumber() + '</td>';
        html += '<td><input type="button" value="Remove" onclick="removeProductFromCart(\'' + productId + '\')"/></td>';
        html += '<td><input type="hidden" id="product_' + productId + '" value="' + productId + '"/></td>';
        cart.append(html);

        updateTotal();
      }
    } else {
      displayMessage("Something went wrong. Are you sure that you are the current owner?");
    }
  });
}

function removeProductFromCart(productId) {
  $("#" + productId).remove();
}

function updateProductTotal(input, productId, productPrice) {
  console.log("Updating total for " + productId);

  $("#total_" + productId).html(input.value * productPrice);
  updateTotal();
}

function updateTotal() {
  let total = 0;
  $('*[id*=total_]').each(function () {
    total += parseInt($(this).text(), 10);
  });

  $("#total").html(total);
}

function checkout() {
	updateAccount();

  console.log("Performing Checkout....");

  $('*[id*=product_]').each(function () {
    let productId = $(this).val();
    let quantity = parseInt($("#quantity_" + productId).val(), 10);
    let total = $("#total_" + productId).text();

    console.log("Buying product " + productId + " with quantity " + quantity);

    contractInstance.buy.sendTransaction(productId, quantity, {
      "from": acc,
      "to": contractAddress,
      "value": web3.toWei(total, "wei")
    }, function (error, result) {
      if (!error) {
        console.log("Product " + productId + " purchased successfully.");
        displayMessage("Product " + productId + " purchased successfully.");
      } else {
        displayMessage("Something went wrong. Are you sure that you are the current owner?");
      }
    });
  });

  clearCart();
}

function clearCart() {
  $("#cart").html("");
  updateTotal();
}

function withdraw() {
  contractInstance.withdraw({"from": acc}, function (error, result) {
    if (!error) {
      console.log("Withdrawal successful!");
    } else {
      displayMessage("Something went wrong. Are you sure that you are the current owner?");
    }
  });
}
