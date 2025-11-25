/**
 * Real-Time Update Service
 * 
 * WebSocket server/client stubs for streaming real-time updates to TMS.ai UI.
 * Handles load updates, driver HOS, GPS positions, and system notifications.
 * 
 * NOTE: WebSocket server requires Backend Functions. This provides client-side
 * implementation with polling fallback for platforms without WebSocket support.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

// Message Types
export const MESSAGE_TYPES = {
  // Load Events
  LOAD_CREATED: 'load.created',
  LOAD_UPDATED: 'load.updated',
  LOAD_STATUS_CHANGED: 'load.status_changed',
  LOAD_ASSIGNED: 'load.assigned',
  LOAD_DELIVERED: 'load.delivered',
  
  // Driver Events
  DRIVER_HOS_UPDATED: 'driver.hos_updated',
  DRIVER_STATUS_CHANGED: 'driver.status_changed',
  DRIVER_LOCATION_UPDATED: 'driver.location_updated',
  DRIVER_VIOLATION: 'driver.violation',
  
  // Document Events
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_VERIFIED: 'document.verified',
  
  // Compliance Events
  COMPLIANCE_EXPIRING: 'compliance.expiring',
  COMPLIANCE_EXPIRED: 'compliance.expired',
  
  // System Events
  SYNC_COMPLETED: 'sync.completed',
  SYNC_FAILED: 'sync.failed',
  NOTIFICATION: 'notification',
  
  // Connection Events
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
};

// Connection States
export const CONNECTION_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
};

/**
 * WebSocket Client for Real-Time Updates
 */
export class RealTimeClient {
  constructor(config = {}) {
    this.url = config.url || 'wss://realtime.tms.ai/ws';
    this.reconnectInterval = config.reconnectInterval || 5000;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
    this.heartbeatInterval = config.heartbeatInterval || 30000;
    
    this.ws = null;
    this.connectionState = CONNECTION_STATES.DISCONNECTED;
    this.reconnectAttempts = 0;
    this.heartbeatTimer = null;
    this.listeners = new Map();
    this.subscriptions = new Set();
    this.messageQueue = [];
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.connectionState === CONNECTION_STATES.CONNECTED) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.connectionState = CONNECTION_STATES.CONNECTING;
      this.emit(MESSAGE_TYPES.RECONNECTING, { attempt: this.reconnectAttempts });

      try {
        // WebSocket connection (simulated for client-side)
        // In production, this would connect to actual WebSocket server
        console.log('[RealTimeClient] Connecting to WebSocket server...');
        
        // Simulate successful connection
        setTimeout(() => {
          this.connectionState = CONNECTION_STATES.CONNECTED;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.processQueue();
          this.emit(MESSAGE_TYPES.CONNECTED, { timestamp: new Date().toISOString() });
          resolve();
        }, 100);

      } catch (error) {
        this.connectionState = CONNECTION_STATES.ERROR;
        this.emit(MESSAGE_TYPES.ERROR, { error: error.message });
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionState = CONNECTION_STATES.DISCONNECTED;
    this.emit(MESSAGE_TYPES.DISCONNECTED, { timestamp: new Date().toISOString() });
  }

  /**
   * Subscribe to specific entity updates
   */
  subscribe(entityType, entityId = null) {
    const subscription = entityId ? `${entityType}:${entityId}` : entityType;
    this.subscriptions.add(subscription);
    
    if (this.connectionState === CONNECTION_STATES.CONNECTED) {
      this.send('subscribe', { entityType, entityId });
    }
    
    return () => this.unsubscribe(entityType, entityId);
  }

  /**
   * Unsubscribe from entity updates
   */
  unsubscribe(entityType, entityId = null) {
    const subscription = entityId ? `${entityType}:${entityId}` : entityType;
    this.subscriptions.delete(subscription);
    
    if (this.connectionState === CONNECTION_STATES.CONNECTED) {
      this.send('unsubscribe', { entityType, entityId });
    }
  }

  /**
   * Send message to server
   */
  send(type, payload) {
    const message = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      id: this.generateMessageId()
    };

    if (this.connectionState === CONNECTION_STATES.CONNECTED && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  /**
   * Add event listener
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    
    return () => this.off(eventType, callback);
  }

  /**
   * Remove event listener
   */
  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  /**
   * Emit event to listeners
   */
  emit(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[RealTimeClient] Error in listener for ${eventType}:`, error);
        }
      });
    }

    // Also emit to wildcard listeners
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(callback => {
        try {
          callback({ type: eventType, data });
        } catch (error) {
          console.error('[RealTimeClient] Error in wildcard listener:', error);
        }
      });
    }
  }

  /**
   * Start heartbeat timer
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.connectionState === CONNECTION_STATES.CONNECTED) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat timer
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Process queued messages
   */
  processQueue() {
    while (this.messageQueue.length > 0 && this.connectionState === CONNECTION_STATES.CONNECTED) {
      const message = this.messageQueue.shift();
      if (this.ws) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Attempt reconnection
   */
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.connectionState = CONNECTION_STATES.ERROR;
      this.emit(MESSAGE_TYPES.ERROR, { error: 'Max reconnection attempts reached' });
      return;
    }

    this.reconnectAttempts++;
    this.connectionState = CONNECTION_STATES.RECONNECTING;
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1));
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current connection state
   */
  getConnectionState() {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connectionState === CONNECTION_STATES.CONNECTED;
  }
}

/**
 * Polling-based fallback for real-time updates
 * Used when WebSocket is not available
 */
export class PollingFallback {
  constructor(config = {}) {
    this.pollInterval = config.pollInterval || 10000;
    this.entities = config.entities || ['loads', 'drivers', 'documents'];
    this.lastPollTimestamps = {};
    this.listeners = new Map();
    this.pollingTimer = null;
    this.isPolling = false;
  }

  /**
   * Start polling
   */
  start() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.poll();
    this.pollingTimer = setInterval(() => this.poll(), this.pollInterval);
    
    console.log('[PollingFallback] Started polling with interval:', this.pollInterval);
  }

  /**
   * Stop polling
   */
  stop() {
    this.isPolling = false;
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    console.log('[PollingFallback] Stopped polling');
  }

  /**
   * Poll for updates
   */
  async poll() {
    for (const entity of this.entities) {
      try {
        const lastPoll = this.lastPollTimestamps[entity] || new Date(0).toISOString();
        
        // Fetch entities updated since last poll
        let updates = [];
        
        switch (entity) {
          case 'loads':
            updates = await base44.entities.Load.filter({}, '-updated_date', 50);
            break;
          case 'drivers':
            updates = await base44.entities.Driver.filter({}, '-updated_date', 50);
            break;
          case 'documents':
            updates = await base44.entities.Document.filter({}, '-updated_date', 50);
            break;
        }

        // Filter to only new updates
        const newUpdates = updates.filter(u => 
          new Date(u.updated_date) > new Date(lastPoll)
        );

        if (newUpdates.length > 0) {
          this.emit(`${entity}.updated`, newUpdates);
          this.lastPollTimestamps[entity] = new Date().toISOString();
        }

      } catch (error) {
        console.error(`[PollingFallback] Error polling ${entity}:`, error);
      }
    }
  }

  /**
   * Add event listener
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    return () => this.off(eventType, callback);
  }

  /**
   * Remove event listener
   */
  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  /**
   * Emit event
   */
  emit(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => callback(data));
    }
  }
}

/**
 * React Hook for Real-Time Updates
 */
export function useRealTimeUpdates(config = {}) {
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
  const [lastUpdate, setLastUpdate] = useState(null);
  const clientRef = useRef(null);
  const queryClient = useQueryClient();

  // Initialize client
  useEffect(() => {
    // Use polling fallback (WebSocket requires backend)
    clientRef.current = new PollingFallback({
      pollInterval: config.pollInterval || 15000,
      entities: config.entities || ['loads', 'drivers', 'documents']
    });

    const client = clientRef.current;

    // Set up listeners
    client.on('loads.updated', (updates) => {
      setLastUpdate({ type: 'loads', data: updates, timestamp: new Date() });
      queryClient.invalidateQueries(['loads']);
    });

    client.on('drivers.updated', (updates) => {
      setLastUpdate({ type: 'drivers', data: updates, timestamp: new Date() });
      queryClient.invalidateQueries(['drivers']);
    });

    client.on('documents.updated', (updates) => {
      setLastUpdate({ type: 'documents', data: updates, timestamp: new Date() });
      queryClient.invalidateQueries(['documents']);
    });

    // Start polling
    client.start();
    setConnectionState(CONNECTION_STATES.CONNECTED);

    return () => {
      client.stop();
      setConnectionState(CONNECTION_STATES.DISCONNECTED);
    };
  }, [config.pollInterval, queryClient]);

  // Subscribe to specific entity
  const subscribe = useCallback((entityType, entityId) => {
    if (clientRef.current?.subscribe) {
      return clientRef.current.subscribe(entityType, entityId);
    }
    return () => {};
  }, []);

  return {
    connectionState,
    lastUpdate,
    subscribe,
    isConnected: connectionState === CONNECTION_STATES.CONNECTED
  };
}

/**
 * React Hook for specific entity real-time updates
 */
export function useEntityUpdates(entityType, entityId = null, onUpdate) {
  const { subscribe } = useRealTimeUpdates();

  useEffect(() => {
    const unsubscribe = subscribe(entityType, entityId);
    return unsubscribe;
  }, [entityType, entityId, subscribe]);
}

/**
 * Real-Time Update Provider Component
 */
export function RealTimeProvider({ children, config = {} }) {
  const { connectionState, lastUpdate, isConnected } = useRealTimeUpdates(config);

  return (
    <RealTimeContext.Provider value={{ connectionState, lastUpdate, isConnected }}>
      {children}
    </RealTimeContext.Provider>
  );
}

// Create context
import { createContext, useContext } from 'react';
export const RealTimeContext = createContext(null);

export function useRealTimeContext() {
  return useContext(RealTimeContext);
}

export default RealTimeClient;