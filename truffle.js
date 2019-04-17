const HDWalletProvider = require("truffle-hdwallet-provider");
const infuraKey = 'ce26c7d418db4e4695aaa359a1013ab2';
// const private = require('./private.json');
// const mnemonic = private.funds;
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development : {
      host : "localhost",
      port: 8545,
      network_id: "*", // match any network
    },

    ropsten: {
      provider: new HDWalletProvider(mnemonic, `https://ropsten.infura.io/${infuraKey}`),
      network_id: '*',
      gas: 7000000,
      gasPrice: 3000000000, // 50 gwei, this is very high
      skipDryRun: true,

    }
  }
};
