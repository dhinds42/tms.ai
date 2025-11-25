/**
 * API Gateway / NGINX Rate Limiting Configuration Examples
 * 
 * Examples for configuring rate limiting at the infrastructure level.
 * 100 requests/minute per IP with burst allowance.
 */

export const RATE_LIMIT_CONFIG = {
  // Default limits
  requests_per_minute: 100,
  burst_size: 20,
  
  // Per-endpoint limits
  endpoints: {
    '/api/loads': { rpm: 200, burst: 40 },
    '/api/quotes': { rpm: 100, burst: 20 },
    '/api/webhooks': { rpm: 500, burst: 100 },
    '/api/auth': { rpm: 20, burst: 5 },
    '/api/reports': { rpm: 30, burst: 10 }
  }
};

/**
 * NGINX Configuration for Rate Limiting
 */
export const NGINX_CONFIG = `
# ==============================================
# NGINX Rate Limiting Configuration for TMS.ai
# ==============================================

# Define rate limiting zones
# Format: zone=name:size rate=requests/period

# Global rate limit: 100 req/min per IP
limit_req_zone $binary_remote_addr zone=global_limit:10m rate=100r/m;

# Auth endpoints: 20 req/min (prevent brute force)
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=20r/m;

# Webhook endpoints: 500 req/min (higher for integrations)
limit_req_zone $binary_remote_addr zone=webhook_limit:10m rate=500r/m;

# API key based limiting (for authenticated requests)
limit_req_zone $http_x_api_key zone=apikey_limit:10m rate=1000r/m;

# Connection limiting
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

server {
    listen 443 ssl http2;
    server_name api.tms.ai;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/tms.ai.crt;
    ssl_certificate_key /etc/ssl/private/tms.ai.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # Connection limit: max 50 concurrent connections per IP
    limit_conn conn_limit 50;

    # Default rate limiting for all requests
    # burst=20 allows 20 extra requests to queue
    # nodelay processes burst immediately instead of queuing
    location / {
        limit_req zone=global_limit burst=20 nodelay;
        limit_req_status 429;

        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Authentication endpoints - stricter limits
    location /api/auth {
        limit_req zone=auth_limit burst=5 nodelay;
        limit_req_status 429;

        proxy_pass http://backend;
    }

    # Webhook endpoints - higher limits for integrations
    location /api/webhooks {
        limit_req zone=webhook_limit burst=100 nodelay;
        limit_req_status 429;

        proxy_pass http://backend;
    }

    # Load management endpoints
    location /api/loads {
        limit_req zone=global_limit burst=40 nodelay;
        limit_req_status 429;

        proxy_pass http://backend;
    }

    # Report generation - lower limits (resource intensive)
    location /api/reports {
        limit_req zone=global_limit burst=10;
        limit_req_status 429;

        proxy_pass http://backend;
    }

    # Rate limit exceeded response
    error_page 429 = @rate_limited;
    location @rate_limited {
        default_type application/json;
        return 429 '{"error":"RATE_LIMITED","message":"Too many requests. Please retry after 60 seconds.","retry_after":60}';
    }
}

# Upstream backend servers
upstream backend {
    least_conn;
    server backend1.tms.ai:8080 weight=5;
    server backend2.tms.ai:8080 weight=5;
    keepalive 32;
}
`;

/**
 * AWS API Gateway Configuration (CloudFormation/Terraform style)
 */
export const AWS_API_GATEWAY_CONFIG = `
# ==============================================
# AWS API Gateway Rate Limiting Configuration
# ==============================================

# Usage Plan Configuration
resource "aws_api_gateway_usage_plan" "tms_standard" {
  name        = "tms-standard-plan"
  description = "Standard rate limiting for TMS.ai API"

  api_stages {
    api_id = aws_api_gateway_rest_api.tms_api.id
    stage  = aws_api_gateway_stage.prod.stage_name
  }

  # 100 requests per minute = 6000 per hour
  quota_settings {
    limit  = 144000  # Daily limit
    offset = 0
    period = "DAY"
  }

  throttle_settings {
    burst_limit = 20    # Max concurrent requests
    rate_limit  = 1.67  # ~100 per minute (requests/second)
  }
}

# High-volume plan for integrations
resource "aws_api_gateway_usage_plan" "tms_integration" {
  name        = "tms-integration-plan"
  description = "Higher limits for webhook integrations"

  throttle_settings {
    burst_limit = 100
    rate_limit  = 8.33  # ~500 per minute
  }
}

# Method-level throttling
resource "aws_api_gateway_method_settings" "auth_throttle" {
  rest_api_id = aws_api_gateway_rest_api.tms_api.id
  stage_name  = aws_api_gateway_stage.prod.stage_name
  method_path = "auth/POST"

  settings {
    throttling_burst_limit = 5
    throttling_rate_limit  = 0.33  # ~20 per minute
  }
}
`;

/**
 * Kong API Gateway Configuration
 */
export const KONG_CONFIG = `
# ==============================================
# Kong API Gateway Rate Limiting Configuration
# ==============================================

# Global rate limiting plugin
_format_version: "2.1"

plugins:
  - name: rate-limiting
    config:
      minute: 100
      policy: local
      fault_tolerant: true
      hide_client_headers: false
      redis_ssl: false

services:
  - name: tms-api
    url: http://backend:8080
    routes:
      - name: api-route
        paths:
          - /api
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          hour: 6000
          policy: redis
          redis_host: redis
          redis_port: 6379

  - name: tms-webhooks
    url: http://backend:8080/webhooks
    routes:
      - name: webhook-route
        paths:
          - /api/webhooks
    plugins:
      - name: rate-limiting
        config:
          minute: 500
          policy: redis
          redis_host: redis

  - name: tms-auth
    url: http://backend:8080/auth
    routes:
      - name: auth-route
        paths:
          - /api/auth
    plugins:
      - name: rate-limiting
        config:
          minute: 20
          policy: redis
          redis_host: redis
`;

/**
 * Cloudflare Rate Limiting Rules (API format)
 */
export const CLOUDFLARE_CONFIG = {
  rules: [
    {
      description: "Global API rate limit - 100 req/min",
      expression: "(http.request.uri.path contains \"/api/\")",
      action: "block",
      ratelimit: {
        characteristics: ["ip.src"],
        period: 60,
        requests_per_period: 100,
        mitigation_timeout: 60
      }
    },
    {
      description: "Auth endpoint protection - 20 req/min",
      expression: "(http.request.uri.path contains \"/api/auth\")",
      action: "block",
      ratelimit: {
        characteristics: ["ip.src"],
        period: 60,
        requests_per_period: 20,
        mitigation_timeout: 300
      }
    },
    {
      description: "Webhook endpoints - 500 req/min",
      expression: "(http.request.uri.path contains \"/api/webhooks\")",
      action: "block",
      ratelimit: {
        characteristics: ["ip.src"],
        period: 60,
        requests_per_period: 500,
        mitigation_timeout: 60
      }
    }
  ]
};

/**
 * Express.js middleware example (for reference)
 */
export const EXPRESS_RATE_LIMIT = `
// Express.js rate limiting middleware
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

// Global rate limiter: 100 req/min
const globalLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'RATE_LIMITED',
      message: 'Too many requests, please try again later.',
      retry_after: 60
    });
  }
});

// Auth rate limiter: 20 req/min
const authLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 60 * 1000,
  max: 20,
  skipSuccessfulRequests: false
});

// Apply middleware
app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);
`;

export default {
  RATE_LIMIT_CONFIG,
  NGINX_CONFIG,
  AWS_API_GATEWAY_CONFIG,
  KONG_CONFIG,
  CLOUDFLARE_CONFIG,
  EXPRESS_RATE_LIMIT
};