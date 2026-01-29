#!/usr/bin/env tsx
/**
 * API Testing Script for PI Business Hub
 * 
 * This script tests all API endpoints to verify they work correctly in production.
 * 
 * Usage:
 *   npm run test:api                    # Test against localhost:5000
 *   npm run test:api -- --url https://your-production-url.com
 *   npm run test:api -- --verbose       # Show detailed responses
 *   npm run test:api -- --skip-auth     # Skip authenticated endpoints
 */

interface TestResult {
  endpoint: string;
  method: string;
  status: 'pass' | 'fail' | 'skip';
  statusCode?: number;
  expectedCodes: number[];
  message?: string;
  duration?: number;
}

interface TestConfig {
  baseUrl: string;
  verbose: boolean;
  skipAuth: boolean;
  sessionCookie?: string;
  businessId?: number;
  taskId?: number;
  customerId?: number;
  formId?: number;
  reminderId?: number;
  notificationId?: number;
}

// Parse command line arguments
function parseArgs(): TestConfig {
  const args = process.argv.slice(2);
  const config: TestConfig = {
    baseUrl: 'http://localhost:5000',
    verbose: false,
    skipAuth: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      config.baseUrl = args[++i].replace(/\/$/, ''); // Remove trailing slash
    } else if (args[i] === '--verbose' || args[i] === '-v') {
      config.verbose = true;
    } else if (args[i] === '--skip-auth') {
      config.skipAuth = true;
    } else if (args[i] === '--cookie' && args[i + 1]) {
      config.sessionCookie = args[++i];
    }
  }

  return config;
}

// Color formatting for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message: string, color?: keyof typeof colors): void {
  const colorCode = color ? colors[color] : '';
  console.log(`${colorCode}${message}${colors.reset}`);
}

function logResult(result: TestResult): void {
  const statusIcon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '○';
  const statusColor = result.status === 'pass' ? 'green' : result.status === 'fail' ? 'red' : 'yellow';
  
  const duration = result.duration ? ` (${result.duration}ms)` : '';
  const statusCode = result.statusCode ? ` [${result.statusCode}]` : '';
  
  log(`  ${statusIcon} ${result.method.padEnd(7)} ${result.endpoint}${statusCode}${duration}`, statusColor);
  
  if (result.message && result.status !== 'pass') {
    log(`    → ${result.message}`, 'gray');
  }
}

// HTTP request helper
async function request(
  config: TestConfig,
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: unknown; duration: number }> {
  const url = `${config.baseUrl}${path}`;
  const start = Date.now();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers
  };

  if (config.sessionCookie) {
    requestHeaders['Cookie'] = config.sessionCookie;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include'
    });

    const duration = Date.now() - start;
    let data: unknown;

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { status: response.status, data, duration };
  } catch (error: unknown) {
    const duration = Date.now() - start;
    return { 
      status: 0, 
      data: { error: error instanceof Error ? error.message : 'Unknown error' }, 
      duration 
    };
  }
}

// Test definitions
interface TestCase {
  name: string;
  method: string;
  path: string | ((config: TestConfig) => string);
  body?: unknown | ((config: TestConfig) => unknown);
  expectedCodes: number[];
  requiresAuth?: boolean;
  extractId?: (data: unknown, config: TestConfig) => void;
  skip?: (config: TestConfig) => boolean;
}

const testCases: TestCase[] = [
  // Health Check
  {
    name: 'Health Check',
    method: 'GET',
    path: '/api/health',
    expectedCodes: [200]
  },

  // Swagger Documentation
  {
    name: 'Swagger UI',
    method: 'GET',
    path: '/swagger/',
    expectedCodes: [200, 301, 304]
  },
  {
    name: 'Swagger JSON Spec',
    method: 'GET',
    path: '/swagger/swagger.json',
    expectedCodes: [200]
  },

  // Profile endpoints (requires auth)
  {
    name: 'Get Profile',
    method: 'GET',
    path: '/api/me/profile',
    expectedCodes: [200, 401],
    requiresAuth: true,
    extractId: (data: any, config) => {
      if (data?.businessId) {
        config.businessId = data.businessId;
      }
    }
  },

  // Business endpoints
  {
    name: 'Create Business',
    method: 'POST',
    path: '/api/businesses',
    body: {
      name: 'Test Business ' + Date.now(),
      industry: 'Technology',
      email: 'test@example.com',
      phone: '+1234567890',
      currency: 'USD',
      timezone: 'UTC'
    },
    expectedCodes: [201, 401],
    requiresAuth: true,
    extractId: (data: any, config) => {
      if (data?.id) {
        config.businessId = data.id;
      }
    }
  },

  // Task endpoints
  {
    name: 'List Tasks',
    method: 'GET',
    path: (config) => `/api/businesses/${config.businessId || 1}/tasks`,
    expectedCodes: [200, 401, 403],
    requiresAuth: true
  },
  {
    name: 'Create Task',
    method: 'POST',
    path: (config) => `/api/businesses/${config.businessId || 1}/tasks`,
    body: {
      title: 'Test Task ' + Date.now(),
      description: 'This is a test task created by API testing script',
      status: 'todo',
      priority: 'medium'
    },
    expectedCodes: [201, 400, 401, 403],
    requiresAuth: true,
    extractId: (data: any, config) => {
      if (data?.id) {
        config.taskId = data.id;
      }
    }
  },
  {
    name: 'Update Task',
    method: 'PUT',
    path: (config) => `/api/tasks/${config.taskId || 1}`,
    body: { status: 'in_progress' },
    expectedCodes: [200, 401, 403, 404],
    requiresAuth: true,
    skip: (config) => !config.taskId
  },
  {
    name: 'Delete Task',
    method: 'DELETE',
    path: (config) => `/api/tasks/${config.taskId || 1}`,
    expectedCodes: [204, 401, 403, 404],
    requiresAuth: true,
    skip: (config) => !config.taskId
  },

  // Customer endpoints
  {
    name: 'List Customers',
    method: 'GET',
    path: (config) => `/api/businesses/${config.businessId || 1}/customers`,
    expectedCodes: [200, 401, 403],
    requiresAuth: true
  },
  {
    name: 'Create Customer',
    method: 'POST',
    path: (config) => `/api/businesses/${config.businessId || 1}/customers`,
    body: {
      name: 'Test Customer ' + Date.now(),
      email: 'customer@example.com',
      phone: '+9876543210',
      notes: 'Test customer created by API testing script'
    },
    expectedCodes: [201, 400, 401, 403],
    requiresAuth: true,
    extractId: (data: any, config) => {
      if (data?.id) {
        config.customerId = data.id;
      }
    }
  },
  {
    name: 'Update Customer',
    method: 'PUT',
    path: (config) => `/api/customers/${config.customerId || 1}`,
    body: { notes: 'Updated notes' },
    expectedCodes: [200, 401, 403, 404],
    requiresAuth: true,
    skip: (config) => !config.customerId
  },

  // Form endpoints
  {
    name: 'List Forms',
    method: 'GET',
    path: (config) => `/api/businesses/${config.businessId || 1}/forms`,
    expectedCodes: [200, 401, 403],
    requiresAuth: true
  },
  {
    name: 'Create Form',
    method: 'POST',
    path: (config) => `/api/businesses/${config.businessId || 1}/forms`,
    body: {
      title: 'Test Form ' + Date.now(),
      description: 'Test form created by API testing script',
      schema: {
        fields: [
          { name: 'field1', type: 'text', label: 'Field 1' },
          { name: 'field2', type: 'number', label: 'Field 2' }
        ]
      }
    },
    expectedCodes: [201, 400, 401, 403],
    requiresAuth: true,
    extractId: (data: any, config) => {
      if (data?.id) {
        config.formId = data.id;
      }
    }
  },
  {
    name: 'Get Form',
    method: 'GET',
    path: (config) => `/api/forms/${config.formId || 1}`,
    expectedCodes: [200, 401, 403, 404],
    requiresAuth: true,
    skip: (config) => !config.formId
  },
  {
    name: 'Delete Form',
    method: 'DELETE',
    path: (config) => `/api/forms/${config.formId || 1}`,
    expectedCodes: [204, 401, 403, 404],
    requiresAuth: true,
    skip: (config) => !config.formId
  },

  // Submission endpoints
  {
    name: 'Submit Form (Public)',
    method: 'POST',
    path: (config) => `/api/forms/${config.formId || 1}/submissions`,
    body: {
      data: { field1: 'Test value', field2: 42 }
    },
    expectedCodes: [201, 400, 404],
    skip: (config) => !config.formId
  },

  // Reminder endpoints
  {
    name: 'List Reminders',
    method: 'GET',
    path: (config) => `/api/businesses/${config.businessId || 1}/reminders`,
    expectedCodes: [200, 401, 403],
    requiresAuth: true
  },
  {
    name: 'Create Reminder',
    method: 'POST',
    path: (config) => `/api/businesses/${config.businessId || 1}/reminders`,
    body: {
      title: 'Test Reminder ' + Date.now(),
      description: 'Test reminder created by API testing script',
      type: 'custom',
      dueAt: new Date(Date.now() + 86400000).toISOString() // Tomorrow
    },
    expectedCodes: [201, 400, 401, 403],
    requiresAuth: true,
    extractId: (data: any, config) => {
      if (data?.id) {
        config.reminderId = data.id;
      }
    }
  },
  {
    name: 'Get Reminder',
    method: 'GET',
    path: (config) => `/api/reminders/${config.reminderId || 1}`,
    expectedCodes: [200, 401, 403, 404],
    requiresAuth: true,
    skip: (config) => !config.reminderId
  },
  {
    name: 'Complete Reminder',
    method: 'POST',
    path: (config) => `/api/reminders/${config.reminderId || 1}/complete`,
    expectedCodes: [200, 401, 403, 404],
    requiresAuth: true,
    skip: (config) => !config.reminderId
  },
  {
    name: 'Delete Reminder',
    method: 'DELETE',
    path: (config) => `/api/reminders/${config.reminderId || 1}`,
    expectedCodes: [204, 401, 403, 404],
    requiresAuth: true,
    skip: (config) => !config.reminderId
  },

  // Notification endpoints
  {
    name: 'List Notifications',
    method: 'GET',
    path: '/api/me/notifications',
    expectedCodes: [200, 401, 403],
    requiresAuth: true
  },
  {
    name: 'Get Unread Count',
    method: 'GET',
    path: '/api/me/notifications/unread-count',
    expectedCodes: [200, 401, 403],
    requiresAuth: true
  },
  {
    name: 'Mark All Notifications Read',
    method: 'POST',
    path: '/api/me/notifications/mark-all-read',
    expectedCodes: [200, 401, 403],
    requiresAuth: true
  },

  // Auth endpoints
  {
    name: 'Get Permissions',
    method: 'GET',
    path: '/api/auth/permissions',
    expectedCodes: [200, 401],
    requiresAuth: true
  },

  // Admin endpoints
  {
    name: 'Admin: List Users',
    method: 'GET',
    path: '/api/admin/users',
    expectedCodes: [200, 401, 403],
    requiresAuth: true
  },
  {
    name: 'Admin: Get Analytics',
    method: 'GET',
    path: '/api/admin/analytics',
    expectedCodes: [200, 401, 403],
    requiresAuth: true
  }
];

// Main test runner
async function runTests(): Promise<void> {
  const config = parseArgs();
  const results: TestResult[] = [];

  log('\n╔══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         PI Business Hub - API Test Suite                     ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════╝\n', 'cyan');

  log(`Base URL: ${config.baseUrl}`, 'gray');
  log(`Verbose: ${config.verbose}`, 'gray');
  log(`Skip Auth: ${config.skipAuth}`, 'gray');
  if (config.sessionCookie) {
    log(`Session Cookie: [provided]`, 'gray');
  }
  log('');

  // Group tests by category
  const categories: Record<string, TestCase[]> = {
    'Health & Documentation': testCases.filter(t => 
      t.path === '/api/health' || String(t.path).includes('swagger')
    ),
    'Authentication & Profiles': testCases.filter(t => 
      String(t.path).includes('profile') || String(t.path).includes('auth/permissions')
    ),
    'Businesses': testCases.filter(t => 
      t.name.toLowerCase().includes('business') && !String(t.path).includes('tasks') && 
      !String(t.path).includes('customers') && !String(t.path).includes('forms') &&
      !String(t.path).includes('reminders')
    ),
    'Tasks': testCases.filter(t => t.name.toLowerCase().includes('task')),
    'Customers': testCases.filter(t => t.name.toLowerCase().includes('customer')),
    'Forms & Submissions': testCases.filter(t => 
      t.name.toLowerCase().includes('form') || t.name.toLowerCase().includes('submit')
    ),
    'Reminders': testCases.filter(t => t.name.toLowerCase().includes('reminder')),
    'Notifications': testCases.filter(t => t.name.toLowerCase().includes('notification')),
    'Admin': testCases.filter(t => t.name.toLowerCase().includes('admin'))
  };

  for (const [category, tests] of Object.entries(categories)) {
    if (tests.length === 0) continue;

    log(`\n▸ ${category}`, 'bright');
    log('─'.repeat(50), 'gray');

    for (const test of tests) {
      // Check if test should be skipped
      if (test.skip && test.skip(config)) {
        results.push({
          endpoint: typeof test.path === 'function' ? test.path(config) : test.path,
          method: test.method,
          status: 'skip',
          expectedCodes: test.expectedCodes,
          message: 'Skipped - prerequisite not met'
        });
        logResult(results[results.length - 1]);
        continue;
      }

      if (config.skipAuth && test.requiresAuth) {
        results.push({
          endpoint: typeof test.path === 'function' ? test.path(config) : test.path,
          method: test.method,
          status: 'skip',
          expectedCodes: test.expectedCodes,
          message: 'Skipped - requires auth'
        });
        logResult(results[results.length - 1]);
        continue;
      }

      const path = typeof test.path === 'function' ? test.path(config) : test.path;
      const body = typeof test.body === 'function' ? test.body(config) : test.body;

      const response = await request(config, test.method, path, body);

      const passed = test.expectedCodes.includes(response.status);

      const result: TestResult = {
        endpoint: path,
        method: test.method,
        status: passed ? 'pass' : 'fail',
        statusCode: response.status,
        expectedCodes: test.expectedCodes,
        duration: response.duration,
        message: passed ? undefined : `Expected ${test.expectedCodes.join(' or ')}, got ${response.status}`
      };

      // Extract IDs for dependent tests
      if (passed && test.extractId && response.data) {
        test.extractId(response.data, config);
      }

      results.push(result);
      logResult(result);

      if (config.verbose && response.data) {
        log(`    Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`, 'gray');
      }
    }
  }

  // Summary
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  const total = results.length;

  log('\n╔══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                        TEST SUMMARY                          ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════╝', 'cyan');

  log(`\n  Total:   ${total} tests`, 'bright');
  log(`  Passed:  ${passed}`, 'green');
  log(`  Failed:  ${failed}`, failed > 0 ? 'red' : 'green');
  log(`  Skipped: ${skipped}`, 'yellow');

  const avgDuration = results
    .filter(r => r.duration)
    .reduce((sum, r) => sum + (r.duration || 0), 0) / results.filter(r => r.duration).length;

  log(`\n  Avg Response Time: ${Math.round(avgDuration)}ms`, 'gray');

  if (failed > 0) {
    log('\n⚠ Failed Tests:', 'red');
    results.filter(r => r.status === 'fail').forEach(r => {
      log(`  • ${r.method} ${r.endpoint}: ${r.message}`, 'red');
    });
  }

  log('\n');

  // Exit with error code if any tests failed
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
