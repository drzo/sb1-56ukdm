export const config = {
  port: process.env.PORT || 3000,
  cors: {
    allowedOrigins: '*',
    allowedMethods: 'GET, POST, OPTIONS',
    allowedHeaders: 'Content-Type'
  }
};