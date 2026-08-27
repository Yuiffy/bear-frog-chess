const { spawn } = require('child_process');
const path = require('path');

const roomPort = process.env.GAME_SERVER_PORT || '5001';
const roomHost = process.env.GAME_SERVER_HOST || '127.0.0.1';
const protocol = process.env.HTTPS === 'true' ? 'wss' : 'ws';
const children = [];
let stopping = false;

function run(script, argumentsList, environment) {
  const child = spawn(process.execPath, [script, ...argumentsList], {
    stdio: 'inherit',
    env: { ...process.env, ...environment },
  });
  children.push(child);
  child.on('exit', (code) => {
    if (stopping) return;
    stopping = true;
    if (code && !process.exitCode) process.exitCode = code;
    children.forEach((runningChild) => {
      if (runningChild !== child && !runningChild.killed) runningChild.kill();
    });
  });
  return child;
}

run(path.resolve(__dirname, '..', 'server', 'index.js'), [], {
  GAME_SERVER_PORT: roomPort,
  GAME_SERVER_HOST: roomHost,
});
run(require.resolve('react-scripts/bin/react-scripts.js'), ['start'], {
  REACT_APP_WS_URL: `${protocol}://${roomHost}:${roomPort}/ws`,
});

function stop() {
  stopping = true;
  children.forEach((child) => {
    if (!child.killed) child.kill();
  });
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
