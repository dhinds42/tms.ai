/**
 * Event-Driven Architecture & Message Queue
 * Async event processing for load updates, document processing, etc.
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.processing = false;
    this.eventHistory = []; // For replay capability
    this.maxHistorySize = 1000;
  }

  /**
   * Subscribe to an event
   */
  on(eventType, handler, options = {}) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const listener = {
      handler,
      priority: options.priority || 0,
      async: options.async !== false,
      id: `${eventType}_${Date.now()}_${Math.random()}`
    };

    this.listeners.get(eventType).push(listener);
    
    // Sort by priority (higher first)
    this.listeners.get(eventType).sort((a, b) => b.priority - a.priority);

    return () => this.off(eventType, listener.id);
  }

  /**
   * Unsubscribe from an event
   */
  off(eventType, listenerId) {
    if (!this.listeners.has(eventType)) return;
    
    const listeners = this.listeners.get(eventType);
    const index = listeners.findIndex(l => l.id === listenerId);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emit an event (async processing)
   */
  async emit(eventType, data, options = {}) {
    const event = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      id: `evt_${Date.now()}_${Math.random()}`,
      replay: options.replay || false
    };

    // Add to history for replay
    if (!options.replay) {
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }
    }

    // Queue the event
    this.eventQueue.push(event);

    // Process queue if not already processing
    if (!this.processing) {
      this.processQueue();
    }

    return event.id;
  }

  /**
   * Process event queue asynchronously
   */
  async processQueue() {
    if (this.processing || this.eventQueue.length === 0) return;

    this.processing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      await this.processEvent(event);
    }

    this.processing = false;
  }

  /**
   * Process a single event
   */
  async processEvent(event) {
    const listeners = this.listeners.get(event.type) || [];

    for (const listener of listeners) {
      try {
        if (listener.async) {
          // Non-blocking async execution
          listener.handler(event.data).catch(err => {
            console.error(`Event handler error for ${event.type}:`, err);
          });
        } else {
          // Blocking execution
          await listener.handler(event.data);
        }
      } catch (error) {
        console.error(`Event handler error for ${event.type}:`, error);
      }
    }
  }

  /**
   * Replay events from history
   */
  async replay(filter = {}) {
    const { fromTimestamp, eventTypes } = filter;

    let eventsToReplay = [...this.eventHistory];

    if (fromTimestamp) {
      eventsToReplay = eventsToReplay.filter(e => 
        new Date(e.timestamp) >= new Date(fromTimestamp)
      );
    }

    if (eventTypes && eventTypes.length > 0) {
      eventsToReplay = eventsToReplay.filter(e => 
        eventTypes.includes(e.type)
      );
    }

    console.log(`Replaying ${eventsToReplay.length} events...`);

    for (const event of eventsToReplay) {
      await this.emit(event.type, event.data, { replay: true });
    }

    return eventsToReplay.length;
  }

  /**
   * Get event history
   */
  getHistory(filter = {}) {
    let history = [...this.eventHistory];

    if (filter.eventType) {
      history = history.filter(e => e.type === filter.eventType);
    }

    if (filter.limit) {
      history = history.slice(-filter.limit);
    }

    return history;
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.eventHistory = [];
  }
}

// Singleton instance
const eventBus = new EventBus();

// Event types constants
export const EVENT_TYPES = {
  // Load events
  LOAD_CREATED: 'load.created',
  LOAD_UPDATED: 'load.updated',
  LOAD_STATUS_CHANGED: 'load.status_changed',
  LOAD_ASSIGNED: 'load.assigned',
  LOAD_DELIVERED: 'load.delivered',
  
  // Document events
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_PROCESSED: 'document.processed',
  DOCUMENT_APPROVED: 'document.approved',
  
  // Carrier events
  CARRIER_CREATED: 'carrier.created',
  CARRIER_SCORE_UPDATED: 'carrier.score_updated',
  CARRIER_COMPLIANCE_ALERT: 'carrier.compliance_alert',
  
  // Driver events
  DRIVER_ASSIGNED: 'driver.assigned',
  DRIVER_HOS_ALERT: 'driver.hos_alert',
  DRIVER_PERFORMANCE_UPDATED: 'driver.performance_updated',
  
  // System events
  EMAIL_SENT: 'system.email_sent',
  SMS_SENT: 'system.sms_sent',
  NOTIFICATION_SENT: 'system.notification_sent'
};

export default eventBus;

/**
 * React Hook for event bus
 */
export function useEventBus() {
  return {
    emit: (type, data) => eventBus.emit(type, data),
    on: (type, handler, options) => eventBus.on(type, handler, options),
    off: (type, listenerId) => eventBus.off(type, listenerId),
    replay: (filter) => eventBus.replay(filter),
    getHistory: (filter) => eventBus.getHistory(filter)
  };
}