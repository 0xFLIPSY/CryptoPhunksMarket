require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require('hardhat-log-remover'); // npx hardhat remove-logs
let secret = require('./secret');
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000000, // default: 200
          },
        }
      },
    ],
  },
  defaultNetwork: "hardhat",
   networks: {
     hardhat: {
       forking: {
         url: secret.mainnetUrl,
         enabled: true
       }
     }
   },
   gasReporter: {
     //enabled: (process.env.REPORT_GAS) ? true : false,
     coinmarketcap: secret.coinMarketCap,
     currency: 'USD',
     gasPrice: 150,
     showTimeSpent: true,
   }
};
