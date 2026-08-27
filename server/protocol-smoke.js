const assert = require('assert');
const { WebSocket } = require('ws');

const { createGameServer, PROTOCOL_VERSION } = require('./index');

const TEST_ROOM = 'ABCD23';
const MESSAGE_TIMEOUT_MS = 3000;

function openSocket(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.once('open', () => resolve(socket));
    socket.once('error', reject);
  });
}

function waitForMessage(socket, predicate) {
  return new Promise((resolve, reject) => {
    let timer;
    const onMessage = (raw) => {
      const message = JSON.parse(raw.toString());
      if (!predicate(message)) return;
      clearTimeout(timer);
      socket.off('message', onMessage);
      resolve(message);
    };
    timer = setTimeout(() => {
      socket.off('message', onMessage);
      reject(new Error('Timed out waiting for WebSocket message'));
    }, MESSAGE_TIMEOUT_MS);
    socket.on('message', onMessage);
  });
}

function send(socket, message) {
  socket.send(JSON.stringify(message));
}

function closeSocket(socket) {
  return new Promise((resolve) => {
    if (socket.readyState === WebSocket.CLOSED) {
      resolve();
      return;
    }
    socket.once('close', resolve);
    socket.close(1000, 'Test complete');
  });
}

async function join(url, payload) {
  const socket = await openSocket(url);
  const welcome = waitForMessage(socket, (message) => message.type === 'welcome');
  send(socket, {
    type: 'join',
    protocol: PROTOCOL_VERSION,
    roomId: TEST_ROOM,
    ...payload,
  });
  return { socket, welcome: await welcome };
}

async function run() {
  const gameServer = createGameServer();
  await new Promise((resolve) => {
    gameServer.server.listen(0, '127.0.0.1', resolve);
  });
  const address = gameServer.server.address();
  const url = `ws://127.0.0.1:${address.port}/ws/${TEST_ROOM}`;
  const sockets = [];

  try {
    const first = await join(url, {
      clientId: 'client-one',
      names: ['红熊', '绿蛙'],
      pieces: ['🐻', '🐸'],
    });
    sockets.push(first.socket);
    assert.strictEqual(first.welcome.seat, 0);
    assert.ok(first.welcome.reconnectToken);

    const second = await join(url, {
      clientId: 'client-two',
      names: ['小狐', '白兔'],
      pieces: ['🦊', '🐰'],
    });
    sockets.push(second.socket);
    assert.strictEqual(second.welcome.seat, 1);
    assert.strictEqual(second.welcome.players[1].piece, '🐰');

    const spectator = await join(url, {
      clientId: 'spectator',
      names: ['猫', '鹅'],
      pieces: ['🐱', '🐧'],
    });
    sockets.push(spectator.socket);
    assert.strictEqual(spectator.welcome.seat, null);

    const moveSnapshot = waitForMessage(
      first.socket,
      (message) => message.type === 'snapshot' && message.revision === 1,
    );
    send(first.socket, {
      type: 'move',
      revision: 0,
      from: { row: 2, col: 0 },
      to: { row: 2, col: 1 },
    });
    const afterMove = await moveSnapshot;
    assert.strictEqual(afterMove.game.turn, 1);
    assert.strictEqual(afterMove.game.board[2][1], 0);
    assert.strictEqual(afterMove.history[0].notation, 'A2–B2');

    const staleError = waitForMessage(
      second.socket,
      (message) => message.type === 'error' && message.code === 'stale_revision',
    );
    send(second.socket, {
      type: 'move',
      revision: 0,
      from: { row: 1, col: 0 },
      to: { row: 1, col: 1 },
    });
    await staleError;

    const disconnectedSnapshot = waitForMessage(
      second.socket,
      (message) => message.type === 'snapshot' && message.players[0].connected === false,
    );
    await closeSocket(first.socket);
    sockets.splice(sockets.indexOf(first.socket), 1);
    await disconnectedSnapshot;

    const resumed = await join(url, {
      clientId: 'client-one-resumed',
      reconnectToken: first.welcome.reconnectToken,
      names: ['红熊', '绿蛙'],
      pieces: ['🐻', '🐸'],
    });
    sockets.push(resumed.socket);
    assert.strictEqual(resumed.welcome.seat, 0);
    assert.strictEqual(resumed.welcome.revision, 1);
    assert.strictEqual(resumed.welcome.players[0].connected, true);

    console.log('Protocol smoke test passed: seats, spectator, move, revision, disconnect, resume');
  } finally {
    await Promise.all(sockets.map(closeSocket));
    await gameServer.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
