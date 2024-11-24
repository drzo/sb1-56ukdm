import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('HTTP Server', () => {
  it('should return 200 status code for home page', async () => {
    const res = await fetch('http://localhost:3000');
    assert.strictEqual(res.status, 200);
  });

  it('should return 200 status code for health check', async () => {
    const res = await fetch('http://localhost:3000/api/health');
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
  });

  it('should return 404 for unknown routes', async () => {
    const res = await fetch('http://localhost:3000/unknown');
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.error, 'Not Found');
  });
});