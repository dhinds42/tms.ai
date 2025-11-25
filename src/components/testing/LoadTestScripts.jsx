/**
 * k6 Load Test Script for TMS.ai Core Load Lifecycle APIs
 * 
 * Run with: k6 run --vus 50 --duration 5m LoadTestScripts.js
 * Or use scenarios defined below for staged ramp-up
 */

// ============================================
// K6 LOAD TEST SCRIPT
// ============================================

export const K6_LOAD_TEST = `
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loadCreationTime = new Trend('load_creation_time');
const loadUpdateTime = new Trend('load_update_time');
const loadFetchTime = new Trend('load_fetch_time');
const apiCalls = new Counter('api_calls');

// Configuration - override with environment variables
const BASE_URL = __ENV.BASE_URL || 'https://api.tms.ai';
const API_KEY = __ENV.API_KEY || 'test_api_key';

// Test scenarios with configurable ramp-up
export const options = {
  scenarios: {
    // Smoke test - quick sanity check
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      tags: { test_type: 'smoke' },
      env: { SCENARIO: 'smoke' },
    },
    
    // Load test - normal traffic
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up to 50 users
        { duration: '5m', target: 50 },   // Stay at 50 users
        { duration: '2m', target: 100 },  // Ramp up to 100 users
        { duration: '5m', target: 100 },  // Stay at 100 users
        { duration: '2m', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'load' },
      startTime: '1m', // Start after smoke test
    },
    
    // Stress test - find breaking point
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '5m', target: 300 },
        { duration: '5m', target: 0 },
      ],
      tags: { test_type: 'stress' },
      startTime: '20m',
    },
    
    // Spike test - sudden traffic surge
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 },  // Instant spike
        { duration: '1m', target: 100 },
        { duration: '10s', target: 500 },  // Massive spike
        { duration: '3m', target: 500 },
        { duration: '10s', target: 100 },
        { duration: '3m', target: 100 },
        { duration: '10s', target: 0 },
      ],
      tags: { test_type: 'spike' },
      startTime: '45m',
    },
  },
  
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.01'],                  // <1% error rate
    errors: ['rate<0.05'],                           // <5% custom errors
    load_creation_time: ['p(95)<1000'],              // Load creation < 1s
    load_update_time: ['p(95)<500'],                 // Updates < 500ms
  },
};

// Auth headers
const headers = {
  'Content-Type': 'application/json',
  'Authorization': \`Bearer \${API_KEY}\`,
};

// Test data generators
function generateLoad() {
  const cities = ['Chicago', 'Detroit', 'Dallas', 'Phoenix', 'Denver', 'Seattle'];
  const states = ['IL', 'MI', 'TX', 'AZ', 'CO', 'WA'];
  const equipment = ['dry_van', 'reefer', 'flatbed'];
  
  return {
    pickup_location: {
      city: cities[Math.floor(Math.random() * cities.length)],
      state: states[Math.floor(Math.random() * states.length)],
      zip: String(10000 + Math.floor(Math.random() * 89999)),
    },
    dropoff_location: {
      city: cities[Math.floor(Math.random() * cities.length)],
      state: states[Math.floor(Math.random() * states.length)],
      zip: String(10000 + Math.floor(Math.random() * 89999)),
    },
    equipment_type: equipment[Math.floor(Math.random() * equipment.length)],
    customer_rate: 1000 + Math.floor(Math.random() * 2000),
    carrier_pay: 800 + Math.floor(Math.random() * 1500),
    weight: 10000 + Math.floor(Math.random() * 30000),
    commodity: 'General Freight',
    status: 'available',
  };
}

// Main test function
export default function() {
  let loadId;
  
  group('Load Lifecycle', () => {
    
    // 1. Create Load
    group('Create Load', () => {
      const payload = JSON.stringify(generateLoad());
      const startTime = Date.now();
      
      const res = http.post(\`\${BASE_URL}/api/loads\`, payload, { headers });
      
      loadCreationTime.add(Date.now() - startTime);
      apiCalls.add(1);
      
      const success = check(res, {
        'create status is 201': (r) => r.status === 201,
        'create returns id': (r) => r.json('id') !== undefined,
      });
      
      errorRate.add(!success);
      
      if (success) {
        loadId = res.json('id');
      }
    });
    
    sleep(1);
    
    // 2. Get Load
    if (loadId) {
      group('Get Load', () => {
        const startTime = Date.now();
        
        const res = http.get(\`\${BASE_URL}/api/loads/\${loadId}\`, { headers });
        
        loadFetchTime.add(Date.now() - startTime);
        apiCalls.add(1);
        
        const success = check(res, {
          'get status is 200': (r) => r.status === 200,
          'get returns correct id': (r) => r.json('id') === loadId,
        });
        
        errorRate.add(!success);
      });
    }
    
    sleep(0.5);
    
    // 3. Update Load Status - Tendered
    if (loadId) {
      group('Update Load - Tendered', () => {
        const payload = JSON.stringify({ status: 'tendered' });
        const startTime = Date.now();
        
        const res = http.patch(\`\${BASE_URL}/api/loads/\${loadId}\`, payload, { headers });
        
        loadUpdateTime.add(Date.now() - startTime);
        apiCalls.add(1);
        
        const success = check(res, {
          'update tendered status is 200': (r) => r.status === 200,
        });
        
        errorRate.add(!success);
      });
    }
    
    sleep(0.5);
    
    // 4. Update Load Status - Assigned
    if (loadId) {
      group('Update Load - Assigned', () => {
        const payload = JSON.stringify({ status: 'assigned', driver_id: 'test_driver' });
        const startTime = Date.now();
        
        const res = http.patch(\`\${BASE_URL}/api/loads/\${loadId}\`, payload, { headers });
        
        loadUpdateTime.add(Date.now() - startTime);
        apiCalls.add(1);
        
        const success = check(res, {
          'update assigned status is 200': (r) => r.status === 200,
        });
        
        errorRate.add(!success);
      });
    }
    
    sleep(0.5);
    
    // 5. Update Load Status - Dispatched
    if (loadId) {
      group('Update Load - Dispatched', () => {
        const payload = JSON.stringify({ status: 'dispatched' });
        const startTime = Date.now();
        
        const res = http.patch(\`\${BASE_URL}/api/loads/\${loadId}\`, payload, { headers });
        
        loadUpdateTime.add(Date.now() - startTime);
        apiCalls.add(1);
        
        check(res, { 'dispatched ok': (r) => r.status === 200 });
      });
    }
    
    sleep(0.5);
    
    // 6. Update Load Status - In Transit
    if (loadId) {
      group('Update Load - In Transit', () => {
        const payload = JSON.stringify({ status: 'in_transit' });
        
        const res = http.patch(\`\${BASE_URL}/api/loads/\${loadId}\`, payload, { headers });
        apiCalls.add(1);
        
        check(res, { 'in_transit ok': (r) => r.status === 200 });
      });
    }
    
    sleep(0.5);
    
    // 7. Update Load Status - Delivered
    if (loadId) {
      group('Update Load - Delivered', () => {
        const payload = JSON.stringify({ status: 'delivered' });
        
        const res = http.patch(\`\${BASE_URL}/api/loads/\${loadId}\`, payload, { headers });
        apiCalls.add(1);
        
        check(res, { 'delivered ok': (r) => r.status === 200 });
      });
    }
    
    sleep(1);
    
    // 8. List Loads
    group('List Loads', () => {
      const res = http.get(\`\${BASE_URL}/api/loads?limit=50\`, { headers });
      apiCalls.add(1);
      
      check(res, {
        'list status is 200': (r) => r.status === 200,
        'list returns array': (r) => Array.isArray(r.json()),
      });
    });
  });
  
  sleep(1);
}

// Summary report
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
    'summary.html': htmlReport(data),
  };
}
`;

// ============================================
// JMETER TEST PLAN (XML)
// ============================================

export const JMETER_TEST_PLAN = `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.5">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="TMS.ai Load Lifecycle Test">
      <stringProp name="TestPlan.comments">Load test for core load lifecycle APIs</stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments">
        <collectionProp name="Arguments.arguments">
          <elementProp name="BASE_URL" elementType="Argument">
            <stringProp name="Argument.name">BASE_URL</stringProp>
            <stringProp name="Argument.value">https://api.tms.ai</stringProp>
          </elementProp>
          <elementProp name="API_KEY" elementType="Argument">
            <stringProp name="Argument.name">API_KEY</stringProp>
            <stringProp name="Argument.value">\${__P(api_key,test_key)}</stringProp>
          </elementProp>
        </collectionProp>
      </elementProp>
    </TestPlan>
    <hashTree>
      <!-- Thread Group: Load Test -->
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Load Lifecycle Thread Group">
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <intProp name="LoopController.loops">10</intProp>
        </elementProp>
        <!-- Configurable thread count -->
        <stringProp name="ThreadGroup.num_threads">\${__P(users,50)}</stringProp>
        <!-- Ramp-up time in seconds -->
        <stringProp name="ThreadGroup.ramp_time">\${__P(rampup,120)}</stringProp>
        <boolProp name="ThreadGroup.scheduler">true</boolProp>
        <stringProp name="ThreadGroup.duration">\${__P(duration,300)}</stringProp>
      </ThreadGroup>
      <hashTree>
        <!-- HTTP Header Manager -->
        <HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP Headers">
          <collectionProp name="HeaderManager.headers">
            <elementProp name="Content-Type" elementType="Header">
              <stringProp name="Header.name">Content-Type</stringProp>
              <stringProp name="Header.value">application/json</stringProp>
            </elementProp>
            <elementProp name="Authorization" elementType="Header">
              <stringProp name="Header.name">Authorization</stringProp>
              <stringProp name="Header.value">Bearer \${API_KEY}</stringProp>
            </elementProp>
          </collectionProp>
        </HeaderManager>
        <hashTree/>
        
        <!-- Create Load -->
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="1. Create Load">
          <stringProp name="HTTPSampler.domain">\${BASE_URL}</stringProp>
          <stringProp name="HTTPSampler.path">/api/loads</stringProp>
          <stringProp name="HTTPSampler.method">POST</stringProp>
          <boolProp name="HTTPSampler.postBodyRaw">true</boolProp>
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments">
              <elementProp name="" elementType="HTTPArgument">
                <stringProp name="Argument.value">{
  "pickup_location": {"city": "Chicago", "state": "IL", "zip": "60601"},
  "dropoff_location": {"city": "Detroit", "state": "MI", "zip": "48201"},
  "equipment_type": "dry_van",
  "customer_rate": \${__Random(1000,3000)},
  "carrier_pay": \${__Random(800,2500)},
  "status": "available"
}</stringProp>
              </elementProp>
            </collectionProp>
          </elementProp>
        </HTTPSamplerProxy>
        <hashTree>
          <!-- Extract Load ID -->
          <JSONPostProcessor guiclass="JSONPostProcessorGui" testclass="JSONPostProcessor" testname="Extract Load ID">
            <stringProp name="JSONPostProcessor.referenceNames">LOAD_ID</stringProp>
            <stringProp name="JSONPostProcessor.jsonPathExprs">$.id</stringProp>
          </JSONPostProcessor>
          <hashTree/>
          <!-- Response Assertion -->
          <ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="Assert 201">
            <stringProp name="Assertion.test_field">Assertion.response_code</stringProp>
            <stringProp name="Assertion.test_type">8</stringProp>
            <stringProp name="Assertion.test_strings">201</stringProp>
          </ResponseAssertion>
          <hashTree/>
        </hashTree>
        
        <!-- Update to Tendered -->
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="2. Update - Tendered">
          <stringProp name="HTTPSampler.path">/api/loads/\${LOAD_ID}</stringProp>
          <stringProp name="HTTPSampler.method">PATCH</stringProp>
          <boolProp name="HTTPSampler.postBodyRaw">true</boolProp>
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments">
              <elementProp name="" elementType="HTTPArgument">
                <stringProp name="Argument.value">{"status": "tendered"}</stringProp>
              </elementProp>
            </collectionProp>
          </elementProp>
        </HTTPSamplerProxy>
        <hashTree/>
        
        <!-- Continue with remaining status transitions... -->
        <ConstantTimer guiclass="ConstantTimerGui" testclass="ConstantTimer" testname="Think Time">
          <stringProp name="ConstantTimer.delay">500</stringProp>
        </ConstantTimer>
        <hashTree/>
        
      </hashTree>
      
      <!-- Summary Report -->
      <ResultCollector guiclass="SummaryReport" testclass="ResultCollector" testname="Summary Report">
        <boolProp name="ResultCollector.error_logging">false</boolProp>
        <stringProp name="filename">results/summary.csv</stringProp>
      </ResultCollector>
      <hashTree/>
      
    </hashTree>
  </hashTree>
</jmeterTestPlan>`;

// ============================================
// CLI RUNNER SCRIPT
// ============================================

export const CLI_RUNNER = `#!/bin/bash
# TMS.ai Load Test Runner
# Usage: ./run-load-test.sh [smoke|load|stress|spike] [users] [duration]

TEST_TYPE=\${1:-load}
USERS=\${2:-50}
DURATION=\${3:-5m}
BASE_URL=\${BASE_URL:-https://api.tms.ai}
API_KEY=\${API_KEY:-test_api_key}

echo "🚀 Running TMS.ai Load Test"
echo "   Type: $TEST_TYPE"
echo "   Users: $USERS"
echo "   Duration: $DURATION"
echo "   Target: $BASE_URL"
echo ""

case $TEST_TYPE in
  smoke)
    k6 run --vus 1 --duration 1m \\
      -e BASE_URL=$BASE_URL -e API_KEY=$API_KEY \\
      LoadTestScripts.js
    ;;
  load)
    k6 run --vus $USERS --duration $DURATION \\
      -e BASE_URL=$BASE_URL -e API_KEY=$API_KEY \\
      LoadTestScripts.js
    ;;
  stress)
    k6 run \\
      -e BASE_URL=$BASE_URL -e API_KEY=$API_KEY \\
      --config stress-config.json \\
      LoadTestScripts.js
    ;;
  spike)
    k6 run \\
      -e BASE_URL=$BASE_URL -e API_KEY=$API_KEY \\
      --config spike-config.json \\
      LoadTestScripts.js
    ;;
  *)
    echo "Unknown test type: $TEST_TYPE"
    exit 1
    ;;
esac

echo ""
echo "✅ Load test complete. Results saved to summary.json"
`;

export default { K6_LOAD_TEST, JMETER_TEST_PLAN, CLI_RUNNER };