const { WebSocketServer, WebSocket } = require('ws');
const readLastLines = require('read-last-lines');
const { parseLogLine } = require('../utils/logparser');
const path = require('path');

const LOG_FILE = path.join(process.cwd(), 'sample.log');

let wss;

const initWebSocket = (httpServer) => {
  wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', async (ws) => {
    console.log('Log viewer client connected');
    try {
      // 1. Fetch last 10 lines
      const history = await readLastLines.read(LOG_FILE, 10);
      const parsedHistory = history
        .split('\n')
        .filter(line => line.trim())
        .map(line => parseLogLine(line));

      ws.send(JSON.stringify({ type: 'HISTORY', data: parsedHistory }));
    } catch (err) {
      console.error("Error reading history:", err);
    }
    ws.on('close', () => console.log('Log viewer client disconnected'));
  });

  return wss;
};

// Broadcasts data to all currently connected clients
const broadcastLog = (logData) => {
  console.log(logData)
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(logData);
    }
  });
};

module.exports = { initWebSocket, broadcastLog };