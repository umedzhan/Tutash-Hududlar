import app from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

async function main() {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`[server] http://localhost:${env.port} da ishga tushdi`);
  });
}

main().catch((err) => {
  console.error('[server] ishga tushmadi:', err);
  process.exit(1);
});
