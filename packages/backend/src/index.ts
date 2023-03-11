import { config } from 'dotenv';

config();

import { createServer } from './server';

const { startServer } = createServer();

startServer(4000).catch(e => {
  console.error(e);
  process.exit(1);
});
