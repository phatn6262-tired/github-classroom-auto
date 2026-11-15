const test = require('node:test');
const assert = require('node:assert');
const {
  createCounter,
  createBatchHandlers,
  formatLogMessage,
  cleanQueryString,
  createConfigManager,
} = require('./index');

test('Bài 1.1: createCounter quản lý private state qua closure', () => {
  const counter = createCounter(10, 2);
  assert.strictEqual(counter.getValue(), 10);
  assert.strictEqual(counter.increment(), 12);
  assert.strictEqual(counter.increment(), 14);
  assert.strictEqual(counter.decrement(), 12);
  assert.strictEqual(counter.reset(), 10);
  assert.strictEqual(counter.getValue(), 10);
  // Không làm lộ biến state ra ngoài
  assert.strictEqual(counter.value, undefined);
});

test('Bài 1.2: createBatchHandlers giải quyết triệt để bẫy closure vòng lặp', () => {
  const handlers = createBatchHandlers(3, 'job');
  assert.strictEqual(handlers.length, 3);
  assert.strictEqual(handlers[0](), 'job-0');
  assert.strictEqual(handlers[1](), 'job-1');
  assert.strictEqual(handlers[2](), 'job-2');
});

test('Bài 2.1: formatLogMessage chuẩn hóa template string có và không có metadata', () => {
  assert.strictEqual(
    formatLogMessage('info', 'Server started on port 3000'),
    '[INFO] Server started on port 3000'
  );

  assert.strictEqual(
    formatLogMessage('error', 'Database connection failed', { retries: 3, host: 'localhost' }),
    '[ERROR] Database connection failed | metadata: {"retries":3,"host":"localhost"}'
  );
});

test('Bài 2.2: cleanQueryString chuẩn hóa template SQL multiline thành 1 dòng', () => {
  const sql = `
    SELECT id, username, email
    FROM users
    WHERE is_active = true
  `;
  assert.strictEqual(
    cleanQueryString(sql),
    'SELECT id, username, email FROM users WHERE is_active = true'
  );
});

test('Bài 3: createConfigManager quản lý cấu hình và bảo vệ tính bất biến', () => {
  const config = createConfigManager({ env: 'development', port: 8080 });
  assert.strictEqual(config.get('port'), 8080);
  assert.strictEqual(config.get('timeout', 5000), 5000);
  assert.strictEqual(config.has('env'), true);
  assert.strictEqual(config.has('missingKey'), false);

  config.set('port', 9000);
  assert.strictEqual(config.get('port'), 9000);

  const exported = config.exportConfig();
  assert.strictEqual(exported.port, 9000);
  assert.strictEqual(Object.isFrozen(exported), true);
  assert.throws(() => {
    'use strict';
    exported.port = 1234;
  }, TypeError);
});
