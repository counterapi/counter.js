/**
 * Integration tests for CounterAPI
 *
 * These tests make actual calls to the CounterAPI endpoints.
 * To run these tests, use: npm test -- -t "integration"
 *
 * IMPORTANT: These tests should be run only when explicitly requested,
 * not as part of regular CI/CD runs, as they depend on external services.
 */

import { Counter } from './client/index';

// Skip these tests by default - only run when explicitly asked
const skipTests = process.env.RUN_INTEGRATION_TESTS !== 'true';
const testRunner = skipTests ? describe.skip : describe;

// Check if we should run integration tests
if (!skipTests) {
  console.warn('\n⚠️  Running integration tests with LIVE API CALLS to CounterAPI ⚠️\n');
}

testRunner('CounterAPI Integration Tests', () => {
  const counter = new Counter({
    workspace: 'test',
    debug: false  // Set to true for detailed request/response logs
  });

  const name = 'test';

  test('should get counter', async () => {
    const result = await counter.get(name);
    expect(result.code).toBe('200');
    expect(result.data.name).toBe(name);
    expect(result.data.workspace_slug).toBe('test');
    expect(typeof result.data.up_count).toBe('number');
    expect(typeof result.data.down_count).toBe('number');
  }, 10000);

  test('should increment counter', async () => {
    const result = await counter.up(name);
    expect(result.code).toBe('200');
    expect(typeof result.data.up_count).toBe('number');
  }, 10000);

  test('should decrement counter', async () => {
    const result = await counter.down(name);
    expect(result.code).toBe('200');
    expect(typeof result.data.down_count).toBe('number');
  }, 10000);

  test('should reset counter', async () => {
    const result = await counter.reset(name);
    expect(result.code).toBe('200');
    expect(result.data.name).toBe(name);
  }, 10000);

  test('should get counter stats', async () => {
    const result = await counter.stats(name);
    expect(result.code).toBe('200');
    expect(typeof result.data.up_count).toBe('number');
    expect(typeof result.data.down_count).toBe('number');
    expect(result.data.stats.today).toBeDefined();
    expect(result.data.stats.this_week).toBeDefined();
    expect(result.data.stats.temporal.hours).toBeDefined();
    expect(result.data.stats.temporal.weekdays).toBeDefined();
    expect(result.data.stats.temporal.quarters).toBeDefined();
  }, 10000);
});
