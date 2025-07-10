import jsforce from 'jsforce';
import { ConnectionType, ConnectionConfig } from '../types/connection.js';
import https from 'https';
import querystring from 'querystring';

/**
 * Creates a Salesforce connection using either username/password or OAuth 2.0 Client Credentials Flow
 * @param config Optional connection configuration
 * @returns Connected jsforce Connection instance
 */
export async function createSalesforceConnection(config?: ConnectionConfig) {
  // Determine connection type from config or environment variables
  const connectionType = config?.type || 
    (process.env.SALESFORCE_CONNECTION_TYPE as ConnectionType) || 
    ConnectionType.User_Password;
  
  // Set login URL from config or environment variable
  const loginUrl = config?.loginUrl || 
    process.env.SALESFORCE_INSTANCE_URL || 
    'https://login.salesforce.com';
  
  try {
    if (connectionType === ConnectionType.OAuth_2_0_Client_Credentials) {
      // OAuth 2.0 Client Credentials Flow
      // PRIORITIZE config properties, then fallback to environment variables
      const clientId = config?.clientId || process.env.SALESFORCE_CLIENT_ID;
      const clientSecret = config?.clientSecret || process.env.SALESFORCE_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        throw new Error('clientId and clientSecret are required for OAuth 2.0 Client Credentials Flow, either in the config object or as environment variables.');
      }
      
      console.error('Connecting to Salesforce using OAuth 2.0 Client Credentials Flow');
      
      // The instanceUrl is derived from loginUrl, which already prioritizes config.loginUrl
      const instanceUrl = loginUrl; 
      
      // Create the token URL
      const tokenUrl = new URL('/services/oauth2/token', instanceUrl);
      
      // Prepare the request body
      const requestBody = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      });
      
      // Make the token request
      const tokenResponse = await new Promise<any>((resolve, reject) => {
        const req = https.request({
          method: 'POST',
          hostname: tokenUrl.hostname,
          path: tokenUrl.pathname,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(requestBody)
          }
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const parsedData = JSON.parse(data);
              if (res.statusCode !== 200) {
                reject(new Error(`OAuth token request failed: ${parsedData.error} - ${parsedData.error_description}`));
              } else {
                resolve(parsedData);
              }
            } catch (e: unknown) {
              reject(new Error(`Failed to parse OAuth response: ${e instanceof Error ? e.message : String(e)}`));
            }
          });
        });
        
        req.on('error', (e) => {
          reject(new Error(`OAuth request error: ${e.message}`));
        });
        
        req.write(requestBody);
        req.end();
      });
      
      // Create connection with the access token
      const conn = new jsforce.Connection({
        instanceUrl: tokenResponse.instance_url,
        accessToken: tokenResponse.access_token
      });
      
      return conn;
    } else {
      // Default: Username/Password Flow with Security Token
      // PRIORITIZE config properties, then fallback to environment variables
      const username = config?.username || process.env.SALESFORCE_USERNAME;
      const password = config?.password || process.env.SALESFORCE_PASSWORD;
      const token = config?.securityToken || process.env.SALESFORCE_TOKEN; // Renamed from SALESFORCE_TOKEN to securityToken in ConnectionConfig
      
      if (!username || !password) {
        throw new Error('username and password are required for Username/Password authentication, either in the config object or as environment variables.');
      }
      
      console.error('Connecting to Salesforce using Username/Password authentication');
      
      // Create connection with login URL
      const conn = new jsforce.Connection({ loginUrl });
      
      await conn.login(
        username,
        password + (token || '')
      );
      
      return conn;
    }
  } catch (error) {
    console.error('Error connecting to Salesforce:', error);
    throw error;
  }
}