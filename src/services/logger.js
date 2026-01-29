const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chokidar = require('chokidar');
const { broadcastLog } = require('./socket_handler');

// Explicitly point to the file in the project root
const LOG_FILE = path.join(process.cwd(), 'sample.log');
let lastReadSize = fs.existsSync(LOG_FILE) ? fs.statSync(LOG_FILE).size : 0;

console.log(LOG_FILE);

const readNewLogs = () => {
  const stats = fs.statSync(LOG_FILE);

  // Reset pointer if file was rotated or cleared
  if (stats.size < lastReadSize) lastReadSize = 0;
  if (stats.size === lastReadSize) return;

  const stream = fs.createReadStream(LOG_FILE, { start: lastReadSize });
  const rl = readline.createInterface({ input: stream });

  rl.on('line', (line) => {
    if (line.trim()) broadcastLog(line);
  });

  rl.on('close', () => {
    lastReadSize = stats.size;
  });
};

const startLogger = () => {
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '');
  }

  chokidar.watch(LOG_FILE, {
    usePolling: true,
    interval: 100,
    persistent: true,
    binaryInterval: 300,
    ignoreInitial: true,
    awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100
    },
  }).on('change', readNewLogs);

  console.log(`[Logger] Watching: ${LOG_FILE}`);
};

module.exports = { startLogger };