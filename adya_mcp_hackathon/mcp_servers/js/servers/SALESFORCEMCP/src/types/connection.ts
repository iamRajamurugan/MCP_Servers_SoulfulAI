/**
 * Enum representing the available Salesforce connection types
 */
export enum ConnectionType {
  /**
   * Standard username/password authentication with security token
   * Requires SALESFORCE_USERNAME, SALESFORCE_PASSWORD, and optionally SALESFORCE_TOKEN
   */
  User_Password = 'User_Password',

  /**
   * OAuth 2.0 Client Credentials Flow using client ID and secret
   * Requires SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET
   */
  OAuth_2_0_Client_Credentials = 'OAuth_2.0_Client_Credentials'
}

/**
 * Configuration options for Salesforce connection
 */
export interface ConnectionConfig {
  /**
   * The type of connection to use
   * @default ConnectionType.OAuth_2_0_Client_Credentials
   */
  type?: ConnectionType;

  /**
   * The login URL for Salesforce instance
   * @default 'https://login.salesforce.com'
   */
  loginUrl?: string;

  /**
   * Username for User_Password connection type
   */
  username?: string;

  /**
   * Password for User_Password connection type
   */
  password?: string;

  /**
   * Security Token for User_Password connection type (if required for the user)
   */
  securityToken?: string;

  /**
   * Client ID (Consumer Key) for OAuth_2_0_Client_Credentials connection type
   */
  clientId?: string;

  /**
   * Client Secret (Consumer Secret) for OAuth_2_0_Client_Credentials connection type
   */
  clientSecret?: string;
}