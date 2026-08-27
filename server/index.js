const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const {
  applyMove,
  createInitialGame,
  positionToLabel,
  validateMove,
} = require('../src/game/rules');

const DEFAULT_PORT = 5001;
const PROTOCOL_VERSION = 2;
const RECONNECT_GRACE_MS = 45000;
const ROOM_IDLE_TTL_MS = 30 * 60 * 1000;
const MAX_MESSAGES_PER_WINDOW = 40;
const RATE_WINDOW_MS = 10000;

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function cleanText(value, fallback, maxLength) {
  if (typeof value !== 'string') return fallback;
  // Control characters are never valid in player-visible names or piece labels.
  // eslint-disable-next-line no-control-regex
  const result = value.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return Array.from(result).slice(0, maxLength).join('') || fallback;
}

function cleanRoomId(value) {
  const roomId = String(value || '').trim().toUpperCase();
  return /^[A-HJ-NP-Z2-9]{4,10}$/.test(roomId) ? roomId : null;
}

function createToken() {
  return crypto.randomBytes(18).toString('base64url');
}

function publicPlayers(room) {
  return room.players.map((player) => (player ? {
    name: player.name,
    piece: player.piece,
    connected: player.connected,
  } : null));
}

function createRoom(roomId) {
  return {
    id: roomId,
    game: createInitialGame(),
    revision: 0,
    players: [null, null],
    clients: new Set(),
    history: [],
    rematchVotes: new Set(),
    emptySince: null,
    updatedAt: Date.now(),
  };
}

function roomSnapshot(room) {
  return {
    type: 'snapshot',
    protocol: PROTOCOL_VERSION,
    roomId: room.id,
    revision: room.revision,
    game: room.game,
    players: publicPlayers(room),
    history: room.history.slice(-24),
    rematchVotes: Array.from(room.rematchVotes),
    serverTime: Date.now(),
  };
}

function send(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
}

function broadcast(room, payload = roomSnapshot(room)) {
  room.clients.forEach((socket) => send(socket, payload));
}

function sendError(socket, code, message) {
  send(socket, { type: 'error', code, message });
}

function releaseExpiredSeats(room) {
  const now = Date.now();
  room.players = room.players.map((player) => {
    if (player && !player.connected && now - player.lastSeen >= RECONNECT_GRACE_MS) return null;
    return player;
  });
}

function assignSeat(room, socket, message) {
  releaseExpiredSeats(room);
  const requestedToken = typeof message.reconnectToken === 'string' ? message.reconnectToken : null;
  let seat = room.players.findIndex((player) => player && player.token === requestedToken);

  if (seat < 0) seat = room.players.findIndex((player) => player === null);
  if (seat < 0) return { seat: null, token: null };

  const existing = room.players[seat];
  const token = existing ? existing.token : createToken();
  if (existing && existing.socket && existing.socket !== socket) {
    send(existing.socket, { type: 'session_replaced' });
    existing.socket.close(4001, 'Session resumed elsewhere');
  }

  room.players[seat] = {
    token,
    clientId: cleanText(message.clientId, createToken(), 64),
    name: cleanText(
      Array.isArray(message.names) ? message.names[seat] : message.name,
      seat === 0 ? '熊方' : '蛙方',
      12,
    ),
    piece: cleanText(
      Array.isArray(message.pieces) ? message.pieces[seat] : message.piece,
      seat === 0 ? '🐻' : '🐸',
      2,
    ),
    connected: true,
    lastSeen: Date.now(),
    socket,
  };
  return { seat, token };
}

function handleJoin(rooms, socket, message) {
  if (socket.roomId) {
    sendError(socket, 'already_joined', '已经加入房间');
    return;
  }

  const roomId = cleanRoomId(message.roomId || socket.requestRoomId);
  if (!roomId) {
    sendError(socket, 'invalid_room', '房间号格式不正确');
    socket.close(4000, 'Invalid room');
    return;
  }

  const room = rooms.get(roomId) || createRoom(roomId);
  rooms.set(roomId, room);
  const assignment = assignSeat(room, socket, message);
  socket.roomId = roomId;
  socket.seat = assignment.seat;
  room.clients.add(socket);
  room.emptySince = null;
  room.updatedAt = Date.now();

  send(socket, {
    ...roomSnapshot(room),
    type: 'welcome',
    seat: assignment.seat,
    reconnectToken: assignment.token,
  });
  broadcast(room);
}

function handleMove(room, socket, message) {
  if (socket.seat === null || socket.seat === undefined) {
    sendError(socket, 'spectator', '旁观者不能落子');
    return;
  }
  if (message.revision !== room.revision) {
    sendError(socket, 'stale_revision', '棋局已更新，正在同步最新局面');
    send(socket, roomSnapshot(room));
    return;
  }

  const move = { from: message.from, to: message.to };
  const validation = validateMove(room.game, move, socket.seat);
  if (!validation.valid) {
    sendError(socket, validation.reason, '这一步不合法');
    return;
  }

  const nextGame = applyMove(room.game, move, socket.seat);
  room.game = nextGame;
  room.revision += 1;
  room.updatedAt = Date.now();
  room.rematchVotes.clear();
  room.history.push({
    number: nextGame.moveNumber,
    player: socket.seat,
    from: move.from,
    to: move.to,
    notation: `${positionToLabel(move.from)}–${positionToLabel(move.to)}`,
    captured: nextGame.lastMove.captured.length,
  });
  broadcast(room);
}

function handleProfile(room, socket, message) {
  if (socket.seat === null || socket.seat === undefined) return;
  const player = room.players[socket.seat];
  if (!player || player.socket !== socket) return;
  player.name = cleanText(message.name, player.name, 12);
  player.piece = cleanText(message.piece, player.piece, 2);
  room.updatedAt = Date.now();
  broadcast(room);
}

function handleRematch(room, socket) {
  if (socket.seat === null || socket.seat === undefined || room.game.status !== 'finished') return;
  room.rematchVotes.add(socket.seat);
  const occupiedSeats = room.players
    .map((player, seat) => (player ? seat : null))
    .filter((seat) => seat !== null);
  const ready = occupiedSeats.length === 2
    && occupiedSeats.every((seat) => room.rematchVotes.has(seat));

  if (ready) {
    room.game = createInitialGame(room.game.winner === null ? 0 : 1 - room.game.winner);
    room.revision += 1;
    room.history = [];
    room.rematchVotes.clear();
  }
  room.updatedAt = Date.now();
  broadcast(room);
}

function withinRateLimit(socket) {
  const now = Date.now();
  if (!socket.rateWindow || now - socket.rateWindow.startedAt > RATE_WINDOW_MS) {
    socket.rateWindow = { startedAt: now, count: 0 };
  }
  socket.rateWindow.count += 1;
  return socket.rateWindow.count <= MAX_MESSAGES_PER_WINDOW;
}

function serveStatic(request, response, buildDirectory) {
  const requestUrl = new URL(request.url, 'http://localhost');
  if (requestUrl.pathname === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ ok: true, protocol: PROTOCOL_VERSION }));
    return;
  }

  if (!fs.existsSync(buildDirectory)) {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({
      name: 'Bear Frog Chess room server',
      protocol: PROTOCOL_VERSION,
      health: '/health',
    }));
    return;
  }

  const requested = decodeURIComponent(requestUrl.pathname);
  const relativePath = requested === '/' ? 'index.html' : requested.replace(/^\/+/, '');
  let filePath = path.resolve(buildDirectory, relativePath);
  if (!filePath.startsWith(`${path.resolve(buildDirectory)}${path.sep}`)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(buildDirectory, 'index.html');
  }

  response.writeHead(200, {
    'Content-Type': CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream',
    'Cache-Control': path.basename(filePath) === 'index.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  fs.createReadStream(filePath).pipe(response);
}

function createGameServer(options = {}) {
  const rooms = new Map();
  const buildDirectory = options.buildDirectory || path.resolve(__dirname, '..', 'build');
  const server = http.createServer((request, response) => serveStatic(request, response, buildDirectory));
  const webSocketServer = new WebSocketServer({ noServer: true, maxPayload: 16 * 1024 });

  server.on('upgrade', (request, socket, head) => {
    const requestUrl = new URL(request.url, 'http://localhost');
    const segments = requestUrl.pathname.split('/').filter(Boolean);
    if (segments[0] !== 'ws') {
      socket.destroy();
      return;
    }
    webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
      webSocket.requestRoomId = segments[1] || requestUrl.searchParams.get('room');
      webSocketServer.emit('connection', webSocket, request);
    });
  });

  webSocketServer.on('connection', (socket) => {
    socket.isAlive = true;
    socket.roomId = null;
    socket.seat = null;
    socket.on('pong', () => { socket.isAlive = true; });

    socket.on('message', (raw) => {
      if (!withinRateLimit(socket)) {
        sendError(socket, 'rate_limited', '操作过于频繁');
        return;
      }

      let message;
      try {
        message = JSON.parse(raw.toString());
      } catch (error) {
        sendError(socket, 'invalid_json', '消息格式不正确');
        return;
      }

      if (message.type === 'join') {
        handleJoin(rooms, socket, message);
        return;
      }
      const room = socket.roomId ? rooms.get(socket.roomId) : null;
      if (!room) {
        sendError(socket, 'join_required', '请先加入房间');
        return;
      }

      if (message.type === 'move') handleMove(room, socket, message);
      else if (message.type === 'profile') handleProfile(room, socket, message);
      else if (message.type === 'rematch') handleRematch(room, socket);
      else if (message.type === 'ping') send(socket, { type: 'pong', serverTime: Date.now() });
      else if (message.type === 'sync') send(socket, roomSnapshot(room));
      else sendError(socket, 'unknown_message', '未知消息类型');
    });

    socket.on('close', () => {
      const room = socket.roomId ? rooms.get(socket.roomId) : null;
      if (!room) return;
      room.clients.delete(socket);
      if (socket.seat !== null && socket.seat !== undefined) {
        const player = room.players[socket.seat];
        if (player && player.socket === socket) {
          player.connected = false;
          player.lastSeen = Date.now();
          player.socket = null;
        }
      }
      room.updatedAt = Date.now();
      if (room.clients.size === 0) room.emptySince = Date.now();
      broadcast(room);
    });
  });

  const maintenance = setInterval(() => {
    webSocketServer.clients.forEach((socket) => {
      if (!socket.isAlive) {
        socket.terminate();
        return;
      }
      socket.isAlive = false;
      socket.ping();
    });
    rooms.forEach((room, roomId) => {
      const previousPlayers = publicPlayers(room);
      releaseExpiredSeats(room);
      if (JSON.stringify(previousPlayers) !== JSON.stringify(publicPlayers(room))) broadcast(room);
      if (room.emptySince && Date.now() - room.emptySince > ROOM_IDLE_TTL_MS) rooms.delete(roomId);
    });
  }, 15000);
  maintenance.unref();

  function close() {
    clearInterval(maintenance);
    webSocketServer.clients.forEach((socket) => socket.close(1001, 'Server stopping'));
    return new Promise((resolve, reject) => {
      webSocketServer.close(() => server.close((error) => (error ? reject(error) : resolve())));
    });
  }

  return {
    server, webSocketServer, rooms, close,
  };
}

if (require.main === module) {
  const port = Number(process.env.GAME_SERVER_PORT || process.env.PORT || DEFAULT_PORT);
  const host = process.env.GAME_SERVER_HOST || '0.0.0.0';
  const gameServer = createGameServer();
  gameServer.server.listen(port, host, () => {
    console.log(`Bear Frog Chess server listening on http://${host}:${port}`);
  });
}

module.exports = {
  PROTOCOL_VERSION,
  RECONNECT_GRACE_MS,
  cleanRoomId,
  createGameServer,
};
