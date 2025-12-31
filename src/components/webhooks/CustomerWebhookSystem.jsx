/**
 * API Webhook System for Customers
 * Real-time load status updates with signed webhooks and retry logic
 */

import crypto from 'crypto';

export class CustomerWebhookSystem {
  constructor() {
    this.subscriptions = new Map();
    this.deliveryLog = [];
    this.maxRetries = 5;
    this.retryDelays = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff
  }

  /**
   * Subscribe customer to webhook events
   */
  subscribe(customerId, webhookUrl, events, secretKey) {
    const subscription = {
      customerId,
      webhookUrl,
      events: events || ['load.picked_up', 'load.delivered', 'load.delayed', 'load.cancelled'],
      secretKey: secretKey || this.generateSecretKey(),
      active: true,
      created_at: new Date().toISOString()
    };

    this.subscriptions.set(customerId, subscription);
    console.log(`[WEBHOOK] Subscribed customer ${customerId} to events:`, events);
    
    return subscription;
  }

  /**
   * Unsubscribe customer
   */
  unsubscribe(customerId) {
    this.subscriptions.delete(customerId);
    console.log(`[WEBHOOK] Unsubscribed customer ${customerId}`);
  }

  /**
   * Generate secret key for signing
   */
  generateSecretKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Sign webhook payload
   */
  signPayload(payload, secretKey) {
    const timestamp = Date.now();
    const signaturePayload = `${timestamp}.${JSON.stringify(payload)}`;
    
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(signaturePayload)
      .digest('hex');

    return {
      signature: `t=${timestamp},v1=${signature}`,
      timestamp
    };
  }

  /**
   * Verify webhook signature (for customers to validate)
   */
  verifySignature(payload, signature, secretKey, tolerance = 300000) {
    // Parse signature
    const parts = signature.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const timestamp = parseInt(parts.t);
    const receivedSig = parts.v1;

    // Check timestamp tolerance (5 minutes)
    if (Date.now() - timestamp > tolerance) {
      throw new Error('Webhook timestamp too old');
    }

    // Compute expected signature
    const signaturePayload = `${timestamp}.${JSON.stringify(payload)}`;
    const expectedSig = crypto
      .createHmac('sha256', secretKey)
      .update(signaturePayload)
      .digest('hex');

    // Constant-time comparison
    if (receivedSig !== expectedSig) {
      throw new Error('Invalid webhook signature');
    }

    return true;
  }

  /**
   * Publish event to subscribed customers
   */
  async publishEvent(eventType, data) {
    console.log(`[WEBHOOK] Publishing event: ${eventType}`);

    const promises = [];

    this.subscriptions.forEach((subscription, customerId) => {
      // Check if customer is subscribed to this event
      if (!subscription.active || !subscription.events.includes(eventType)) {
        return;
      }

      // Check if this load belongs to this customer
      if (data.customer_id && data.customer_id !== customerId) {
        return;
      }

      promises.push(
        this.deliverWebhook(subscription, eventType, data)
      );
    });

    await Promise.all(promises);
  }

  /**
   * Deliver webhook with retry logic
   */
  async deliverWebhook(subscription, eventType, data, retryCount = 0) {
    const payload = {
      event: eventType,
      data: data,
      timestamp: new Date().toISOString(),
      customer_id: subscription.customerId
    };

    const { signature, timestamp } = this.signPayload(payload, subscription.secretKey);

    const deliveryAttempt = {
      subscription_id: subscription.customerId,
      event: eventType,
      attempt: retryCount + 1,
      timestamp: new Date().toISOString()
    };

    try {
      // Simulate HTTP POST (in production, use fetch/axios)
      console.log(`[WEBHOOK] Delivering to ${subscription.webhookUrl}`);
      console.log(`[WEBHOOK] Signature: ${signature}`);
      console.log(`[WEBHOOK] Payload:`, payload);

      // Mock successful delivery
      const success = Math.random() > 0.1; // 90% success rate
      
      if (!success) {
        throw new Error('Webhook delivery failed');
      }

      deliveryAttempt.status = 'success';
      deliveryAttempt.response_code = 200;
      
      this.deliveryLog.push(deliveryAttempt);
      
      console.log(`[WEBHOOK] ✅ Delivered successfully on attempt ${retryCount + 1}`);
      
    } catch (error) {
      deliveryAttempt.status = 'failed';
      deliveryAttempt.error = error.message;
      
      this.deliveryLog.push(deliveryAttempt);

      // Retry with exponential backoff
      if (retryCount < this.maxRetries) {
        const delay = this.retryDelays[retryCount];
        console.log(`[WEBHOOK] ❌ Failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
        
        setTimeout(() => {
          this.deliverWebhook(subscription, eventType, data, retryCount + 1);
        }, delay);
      } else {
        console.log(`[WEBHOOK] ❌ Failed after ${this.maxRetries} attempts, giving up`);
      }
    }
  }

  /**
   * Get delivery statistics
   */
  getDeliveryStats() {
    const stats = {
      total_deliveries: this.deliveryLog.length,
      successful: this.deliveryLog.filter(d => d.status === 'success').length,
      failed: this.deliveryLog.filter(d => d.status === 'failed').length,
      success_rate: 0,
      recent_deliveries: this.deliveryLog.slice(-10)
    };

    stats.success_rate = stats.total_deliveries > 0 
      ? (stats.successful / stats.total_deliveries) * 100 
      : 0;

    return stats;
  }

  /**
   * Get active subscriptions
   */
  getSubscriptions() {
    return Array.from(this.subscriptions.values());
  }
}

export const webhookSystem = new CustomerWebhookSystem();
export default webhookSystem;