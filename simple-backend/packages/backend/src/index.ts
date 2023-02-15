import { config } from 'dotenv';

config();

import { createServer, startServer } from './server';

const server = createServer();

// eslint-disable-next-line @typescript-eslint/no-floating-promises
startServer(server);
