import WebSocket from 'ws';
import crypto from 'crypto';
import { EventEmitter } from 'events';

const logger = {
  log: (message: string) => console.error(message),
  error: (message: string) => console.error(message),
  debug: (message: string) => console.error(message),
};

// Define OpCodes
enum OpCode {
  Hello = 0,
  Identify = 1,
  Identified = 2,
  Reidentify = 3,
  Event = 5,
  Request = 6,
  RequestResponse = 7,
  RequestBatch = 8,
  RequestBatchResponse = 9
}

// Define EventSubscription bitmasks
export enum EventSubscription {
  None = 0,
  General = 1 << 0,
  Config = 1 << 1,
  Scenes = 1 << 2,
  Inputs = 1 << 3,
  Transitions = 1 << 4,
  Filters = 1 << 5,
  Outputs = 1 << 6,
  SceneItems = 1 << 7,
  MediaInputs = 1 << 8,
  Vendors = 1 << 9,
  Ui = 1 << 10,
  All = (1 << 0) | (1 << 1) | (1 << 2) | (1 << 3) | (1 << 4) | (1 << 5) | (1 << 6) | (1 << 7) | (1 << 8) | (1 << 9) | (1 << 10)
}

// Define interfaces for message types
interface BaseMessage {
  op: OpCode;
  d: any;
}

interface HelloMessage extends BaseMessage {
  d: {
    obsStudioVersion: string;
    obsWebSocketVersion: string;
    rpcVersion: number;
    authentication?: {
      challenge: string;
      salt: string;
    };
  };
}

interface IdentifyMessage extends BaseMessage {
  d: {
    rpcVersion: number;
    authentication?: string;
    eventSubscriptions: number;
  };
}

interface IdentifiedMessage extends BaseMessage {
  d: {
    negotiatedRpcVersion: number;
  };
}

interface RequestMessage extends BaseMessage {
  d: {
    requestType: string;
    requestId: string;
    requestData?: any;
  };
}

interface RequestResponseMessage extends BaseMessage {
  d: {
    requestType: string;
    requestId: string;
    requestStatus: {
      result: boolean;
      code: number;
      comment?: string;
    };
    responseData?: any;
  };
}

interface EventMessage extends BaseMessage {
  d: {
    eventType: string;
    eventIntent: number;
    eventData?: any;
  };
}

// Define the OBS WebSocket client class
export class OBSWebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private password: string | null;
  private connected: boolean = false;
  private identified: boolean = false;
  private pendingRequests: Map<string, { resolve: Function, reject: Function, timeout: NodeJS.Timeout }> = new Map();

  constructor(url: string = 'ws://localhost:4455', password: string | null = null) {
    super();
    this.url = url;
    this.password = password;
  }

  /**
   * Connect to the OBS WebSocket server
   */
  public async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.on('open', () => {
          this.connected = true;
          logger.log('Connected to OBS WebSocket server');
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString()) as BaseMessage;
            this.handleMessage(message);
          } catch (error) {
            logger.error(`Error parsing message: ${error instanceof Error ? error.message : String(error)}`);
          }
        });

        this.ws.on('close', () => {
          this.connected = false;
          this.identified = false;
          logger.log('Disconnected from OBS WebSocket server');
          this.emit('disconnected');

          // Clear all pending requests
          this.pendingRequests.forEach((request) => {
            clearTimeout(request.timeout);
            request.reject(new Error('WebSocket connection closed'));
          });
          this.pendingRequests.clear();
        });

        this.ws.on('error', (error) => {
          logger.error(`WebSocket error: ${error instanceof Error ? error.message : String(error)}`);
          reject(error);
        });

        // Set up the identification process
        this.once('hello', async (hello: HelloMessage['d']) => {
          try {
            await this.identify(hello);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the OBS WebSocket server
   */
  public disconnect(): void {
    if (this.ws && this.connected) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
      this.identified = false;
    }
  }

  /**
   * Send a request to the OBS WebSocket server
   */
  public async sendRequest<T = any>(requestType: string, requestData?: any, timeout: number = 10000): Promise<T> {
    if (!this.ws || !this.connected || !this.identified) {
      throw new Error('Not connected or identified with OBS WebSocket server');
    }

    return new Promise<T>((resolve, reject) => {
      const requestId = crypto.randomUUID();

      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request ${requestType} timed out after ${timeout}ms`));
      }, timeout);

      this.pendingRequests.set(requestId, {
        resolve: (data: T) => {
          clearTimeout(timeoutId);
          resolve(data);
        },
        reject: (error: Error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        timeout: timeoutId
      });

      const requestMessage: RequestMessage = {
        op: OpCode.Request,
        d: {
          requestType,
          requestId,
          requestData
        }
      };

      this.ws!.send(JSON.stringify(requestMessage));
    });
  }

  /**
   * Handle incoming messages from the OBS WebSocket server
   */
  private handleMessage(message: BaseMessage): void {
    switch (message.op) {
      case OpCode.Hello:
        this.emit('hello', (message as HelloMessage).d);
        break;

      case OpCode.Identified:
        this.identified = true;
        this.emit('identified', (message as IdentifiedMessage).d);
        break;

      case OpCode.RequestResponse:
        this.handleRequestResponse(message as RequestResponseMessage);
        break;

      case OpCode.Event:
        this.handleEvent(message as EventMessage);
        break;

      default:
        logger.debug(`Unhandled message type: ${message.op}`);
        break;
    }
  }

  /**
   * Handle request responses from the OBS WebSocket server
   */
  private handleRequestResponse(message: RequestResponseMessage): void {
    const { requestId, requestStatus, responseData } = message.d;
    const pendingRequest = this.pendingRequests.get(requestId);

    if (pendingRequest) {
      this.pendingRequests.delete(requestId);

      if (requestStatus.result) {
        pendingRequest.resolve(responseData || {});
      } else {
        const errorMessage = `Request failed: ${requestStatus.code} ${requestStatus.comment || ''}`;
        pendingRequest.reject(new Error(errorMessage));
      }
    }
  }

  /**
   * Handle events from the OBS WebSocket server
   */
  private handleEvent(message: EventMessage): void {
    const { eventType, eventData } = message.d;
    this.emit('event', eventType, eventData);
    this.emit(eventType, eventData);
  }

  /**
   * Identify with the OBS WebSocket server
   */
  private async identify(hello: HelloMessage['d']): Promise<void> {
    if (!this.ws || !this.connected) {
      throw new Error('Not connected to OBS WebSocket server');
    }

    let authentication: string | undefined;

    // Handle authentication if required
    if (hello.authentication && this.password) {
      authentication = this.generateAuthenticationString(
        this.password,
        hello.authentication.salt,
        hello.authentication.challenge
      );
    } else if (hello.authentication && !this.password) {
      throw new Error('Password required for authentication but not provided');
    }

    const identifyMessage: IdentifyMessage = {
      op: OpCode.Identify,
      d: {
        rpcVersion: hello.rpcVersion,
        eventSubscriptions: EventSubscription.All,
      }
    };

    if (authentication) {
      identifyMessage.d.authentication = authentication;
    }

    return new Promise<void>((resolve, reject) => {
      // Set up a one-time listener for the Identified message
      this.once('identified', () => {
        logger.log('Identified with OBS WebSocket server');
        resolve();
      });

      // Set a timeout for identification
      const timeoutId = setTimeout(() => {
        reject(new Error('Identification timed out'));
      }, 5000);

      this.once('identified', () => clearTimeout(timeoutId));

      // Send the Identify message
      this.ws!.send(JSON.stringify(identifyMessage));
    });
  }

  /**
   * Generate authentication string for OBS WebSocket
   */
  private generateAuthenticationString(password: string, salt: string, challenge: string): string {
    // Create SHA256 Base64 encoded secret
    const secretBytes = crypto.createHash('sha256')
      .update(password + salt)
      .digest();
    const secret = secretBytes.toString('base64');

    // Create authentication string
    const authBytes = crypto.createHash('sha256')
      .update(secret + challenge)
      .digest();
    const authentication = authBytes.toString('base64');

    return authentication;
  }
}

export default OBSWebSocketClient;