import http from 'node:http';
import { config } from './config/server.js';
import { handleRoutes } from './routes/index.js';

const server = http.createServer((req, res) => {
  handleRoutes(req, res);
});

server.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});