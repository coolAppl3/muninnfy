import http from 'http';
import { app } from './app';
import { initDb } from './db/initDb';
import { initCronJobs } from './cron-jobs/cronInit';

const port: number = process.env.PORT ? +process.env.PORT : 5000;
const server = http.createServer(app);

async function initServer(): Promise<void> {
  try {
    await initDb();
    initCronJobs();

    server.listen(port, () => {
      console.log(`Server running on port ${port}.`);
    });
  } catch (err: unknown) {
    console.log(err);
    process.exit(1);
  }
}

initServer();
