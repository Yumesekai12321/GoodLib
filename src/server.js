import { openDatabase } from './db/connection.js';
import { migrate } from './db/migrate.js';
import { createApp } from './app.js';
import { auditStock } from './services/stockAudit.js';

const db = openDatabase();
try {
  migrate(db);
  const issues = auditStock(db);
  if (issues.length)
    throw new Error(
      `Stock audit failed: ${JSON.stringify(issues)}. Run npm run db:audit; no data was repaired.`,
    );
  const host = process.env.HOST || '127.0.0.1';
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('PORT must be an integer from 1 to 65535.');
  const server = createApp(db).listen(port, host, () =>
    console.log(`GoodLib: http://${host}:${port}/books`),
  );
  server.on('error', (error) => {
    console.error(error);
    db.close();
    process.exitCode = 1;
  });
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, () =>
      server.close(() => {
        db.close();
        process.exit(0);
      }),
    );
} catch (error) {
  db.close();
  throw error;
}
