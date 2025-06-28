# 🚀 GraphQL Dev Wallet Tracker

This project fetches the token balance of a dev wallet on Solana using GraphQL and the Bitquery API.

It is designed to:

- Track new token creation events (from Pump.fun or other sources)
- Extract the dev wallet (creator address)
- Query Bitquery's GraphQL API for dev wallet token holdings
- Print the balance in your terminal

---

## 🧰 Tech Stack

- Node.js
- graphql-request
- Bitquery GraphQL API

---

## 📦 Setup

1. Clone or download this repository:


git clone <repo-url>
cd graphql-test
// Install the Graphql
npm install

2.Create a file named index.js:

touch index.js

3. index.js
const { GraphQLClient, gql } = require('graphql-request');

const endpoint = 'https://graphql.bitquery.io';
const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    'X-API-KEY': 'YOUR_BITQUERY_API_KEY', // Replace this
  },
});

const query = gql`
  query MyQuery($dev: String, $token: String) {
    Solana {
      BalanceUpdates(
        where: {
          BalanceUpdate: {
            Account: { Owner: { is: $dev } }
            Currency: { MintAddress: { is: $token } }
          }
        }
      ) {
        BalanceUpdate {
          balance: PostBalance(maximum: Block_Slot)
        }
      }
    }
  }
`;

async function getDevHolding(dev, token) {
  const variables = { dev, token };
  try {
    const data = await graphQLClient.request(query, variables);
    const balance = data?.Solana?.BalanceUpdates?.[0]?.BalanceUpdate?.balance || 0;
    console.log(`Dev wallet balance: ${balance}`);
  } catch (error) {
    console.error("GraphQL error:", error);
  }
}

// Example usage:
getDevHolding("DevWalletAddressHere", "TokenMintAddressHere");


▶️ Run It

node index.js

## for free trails of graphql you can visit bitquery website 
## create your own api key which allow you 10,000 calls each call take 231 deducation point 
## visit the link  = https://docs.bitquery.io/docs/examples/Solana/Pump-Fun-API/#get-token-metadata-dev-address-creation-time-for-specific-token
