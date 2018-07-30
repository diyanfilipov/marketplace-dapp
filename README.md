# Marketplace dApp

## Installation

### Requirements
* Ganache 1.2.1
* node 8.11.2
* npm 5.10.0
* Truffle v4.1.13
* Solidity v0.4.24 (solc-js)
* Metamask Chrome/Firefox plugin

## Usage
1) Start Ganache
1) Navigate to the main project folder
2) Execute `truffle compile`
3) Execute `truffle test`
4) Restart Ganache
5) Execute `truffle deploy`
6) Navigate to `/ui`
7) Replace contractAddress value in `script.js` with the deployed Marketplace contract address
8) Execute `npm install`
9) Run `http-server -c-1`
10) Open `http://127.0.0.1:8080`
11) Enjoy!!!

## License
[MIT](https://choosealicense.com/licenses/mit/)
