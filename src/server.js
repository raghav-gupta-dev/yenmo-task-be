const http = require('http');
const app = require('./index');
const { initWebSocket } = require('./services/socket_handler');
const { startLogger } = require('./services/logger');

const PORT = process.env.PORT || 3000;

const startServer = () => {
  try {
    // Wrap Express in native HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket on the SAME server
    initWebSocket(server);

    // Start monitoring the log file
    startLogger();

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`WebSocket active on ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();