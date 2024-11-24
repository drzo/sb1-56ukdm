import { renderHomePage } from '../views/home.js';
import { corsMiddleware } from '../middleware/cors.js';
import { SimpleReservoir } from '../simple-reservoir.js';

const reservoir = new SimpleReservoir(32);

export function handleRoutes(req, res) {
  corsMiddleware(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderHomePage());
  } 
  else if (req.url === '/api/process' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { input } = JSON.parse(body);
      const state = reservoir.process(input);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ state: Array.from(state) }));
    });
  }
  else if (req.url === '/api/reset' && req.method === 'POST') {
    reservoir.reset();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'reset' }));
  }
  else if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy' }));
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
}