const { GraphQLClient, gql } = require('graphql-request');

const endpoint = 'https://streaming.bitquery.io/graphql'; // Not supported via HTTP
// Use Bitquery's REST endpoint instead for queries:
const restEndpoint = 'https://graphql.bitquery.io';

// Try different header configurations for the API key
const apiKey = 'ory_at_drBiX3RKfutDdsceZXIr8-QFOIFM-lnWptQlACXXenk.BFeMrxcZpK5G0YlaGKvyeWyczuIKb9OyXpkQy-m6xEA';

const graphQLClient = new GraphQLClient(restEndpoint, {
  headers: {
    'X-API-KEY': apiKey,
    'Authorization': `Bearer ${apiKey}`,  // Some APIs require Bearer token format
    'api-key': apiKey,                    // Alternative header name
  },
});

// Let's try a schema introspection query first to see what's available
const schemaQuery = gql`
  query {
    __schema {
      queryType {
        name
        fields {
          name
          description
        }
      }
    }
  }
`;

// Let's explore the transfers field in more detail
const transfersSchemaQuery = gql`
  query {
    __type(name: "SolanaTransfer") {
      name
      fields {
        name
        description
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }
`;

// Let's explore the options available for transfers
const transfersOptionsQuery = gql`
  query {
    __type(name: "SolanaTransferOptions") {
      name
      inputFields {
        name
        description
        type {
          name
          kind
        }
      }
    }
  }
`;

// New query focusing on retrieving address data and balances
const solanaQuery = gql`
  query MyQuery($dev: String, $token: String) {
    solana {
      address(address: {is: $dev}) {
        address
        balance
        balances(currency: {address: {is: $token}}) {
          value
          currency {
            symbol
            name
            address
          }
        }
      }
    }
  }
`;

// Let's also fetch more information about the solana schema
const solanaSchemaQuery = gql`
  query {
    __type(name: "Solana") {
      name
      fields {
        name
        description
        type {
          name
          kind
        }
      }
    }
  }
`;

// Get schema info for Solana Address
const addressSchemaQuery = gql`
  query {
    __type(name: "SolanaAddressInfoWithBalance") {
      name
      fields {
        name
        description
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }
`;

// Simple test query
const query = schemaQuery;

async function getSchemaInfo() {
  console.log("API Endpoint:", restEndpoint);
  console.log("Fetching schema information...");

  try {
    const data = await graphQLClient.request(schemaQuery);
    console.log("Available query fields:");
    const fields = data?.__schema?.queryType?.fields || [];
    fields.forEach(field => {
      console.log(`- ${field.name}: ${field.description || 'No description'}`);
    });
    return fields;
  } catch (error) {
    console.error('GraphQL error status:', error.response?.status);
    console.error('Error details:', error.message);
    if (error.response?.status === 401) {
      console.error('Authentication failed. Please check your API key.');
    }
    return null;
  }
}

async function getSolanaSchemaInfo() {
  console.log("\nFetching Solana schema information...");

  try {
    const data = await graphQLClient.request(solanaSchemaQuery);
    console.log("Solana fields:");
    const fields = data?.__type?.fields || [];
    fields.forEach(field => {
      console.log(`- ${field.name}: ${field.description || 'No description'}`);
    });
    return fields;
  } catch (error) {
    console.error('GraphQL error status:', error.response?.status);
    console.error('Error details:', error.message);
    return null;
  }
}

async function getTransfersSchemaInfo() {
  console.log("\nFetching Solana transfers schema information...");

  try {
    const data = await graphQLClient.request(transfersSchemaQuery);
    console.log("Solana transfers fields:");
    const fields = data?.__type?.fields || [];
    fields.forEach(field => {
      console.log(`- ${field.name}: ${field.description || 'No description'}`);
    });
    return fields;
  } catch (error) {
    console.error('GraphQL error status:', error.response?.status);
    console.error('Error details:', error.message);
    return null;
  }
}

async function getTransfersOptionsInfo() {
  console.log("\nFetching Solana transfers options information...");

  try {
    const data = await graphQLClient.request(transfersOptionsQuery);
    console.log("Solana transfers options:");
    const fields = data?.__type?.inputFields || [];
    fields.forEach(field => {
      console.log(`- ${field.name}: ${field.description || 'No description'}`);
    });
    return fields;
  } catch (error) {
    console.error('GraphQL error status:', error.response?.status);
    console.error('Error details:', error.message);
    return null;
  }
}

async function getAddressSchemaInfo() {
  console.log("\nFetching Solana address schema information...");

  try {
    const data = await graphQLClient.request(addressSchemaQuery);
    console.log("Solana address fields:");
    const fields = data?.__type?.fields || [];
    fields.forEach(field => {
      console.log(`- ${field.name}: ${field.description || 'No description'}`);
    });
    return fields;
  } catch (error) {
    console.error('GraphQL error status:', error.response?.status);
    console.error('Error details:', error.message);
    return null;
  }
}

async function getDevHolding(dev, token) {
  const variables = { dev, token };
  
  console.log("\nFetching dev holdings...");
  console.log("Making request with variables:", JSON.stringify(variables, null, 2));

  try {
    const data = await graphQLClient.request(solanaQuery, variables);
    console.log("Query result:", JSON.stringify(data, null, 2));
    
    // Process address data if it exists
    const addressData = data?.solana?.address || [];
    if (addressData.length > 0) {
      console.log(`Found address data for ${dev}`);
      
      addressData.forEach((address, index) => {
        console.log(`Address ${index + 1}: ${address.address}`);
        console.log(`General balance: ${address.balance || 'Not available'}`);
        
        // Check for token-specific balances
        const balances = address.balances || [];
        if (balances.length > 0) {
          balances.forEach((balance, i) => {
            console.log(`Token balance ${i + 1}: ${balance.value} ${balance.currency?.symbol || 'tokens'}`);
          });
        } else {
          console.log(`No token-specific balances found for ${token}`);
        }
      });
    } else {
      console.log(`No address data found for ${dev}`);
    }
    
    return data;
  } catch (error) {
    console.error('GraphQL error status:', error.response?.status);
    console.error('Error details:', error.message);
    if (error.response?.status === 401) {
      console.error('Authentication failed. Please check your API key.');
    }
    return null;
  }
}

// Execute a sequence of operations
async function runQueries() {
  // First, get general schema info
  await getSchemaInfo();
  
  // Get more detailed schema information
  await getSolanaSchemaInfo();
  await getAddressSchemaInfo();
  
  // Then, try the exact query and variables provided by the user
  await getDevHolding(
    '8oTWME5BPpudMksqEKfn562pGobrtnEpNsG66hBBgx92', 
    'Edazh5SW6ts7PocPvPgjrdKyqqszcRcqdB22B8tapump'
  );
}

// Run the sequence
runQueries().catch(error => {
  console.error("Unhandled error:", error);
});