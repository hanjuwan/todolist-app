'use strict';

const app = require('./app');
const env = require('./config/env');
const { healthCheck, shutdown: shutdownPool } = require('./db/pool');

async function main() {
  const ok = await healthCheck();
  console.log(`[db] healthCheck: ${ok ? 'OK' : 'FAIL'}`);

  const server = app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const graceful = (signal) => async () => {
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await shutdownPool();
      console.log('[server] shutdown complete');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', graceful('SIGTERM'));
  process.on('SIGINT', graceful('SIGINT'));
}

main().catch((err) => {
  console.error('[server] fatal startup error', err);
  process.exit(1);
});
