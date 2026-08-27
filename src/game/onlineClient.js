const PROTOCOL_VERSION = 2;
const RETRY_DELAYS = [700, 1200, 2200, 4000, 6000];

function getOrCreateClientId() {
  const key = 'bear-frog-chess:client-id';
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const next = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(key, next);
    return next;
  } catch (error) {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

function normalizeWebSocketBase(rawValue) {
  const pageProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  if (!rawValue) return `${pageProtocol}//${window.location.host}/ws`;
  const raw = rawValue.trim();
  if (raw.startsWith('http://')) return `ws://${raw.slice(7)}`;
  if (raw.startsWith('https://')) return `wss://${raw.slice(8)}`;
  if (raw.startsWith('ws://') || raw.startsWith('wss://')) return raw;
  if (raw.startsWith('//')) return `${pageProtocol}${raw}`;
  return `${pageProtocol}//${raw}`;
}

function getRoomWebSocketUrl(roomId) {
  const configured = process.env.REACT_APP_WS_URL || process.env.REACT_APP_WS_HOST || '';
  const base = normalizeWebSocketBase(configured);
  if (base.includes('{roomId}')) return base.replace('{roomId}', encodeURIComponent(roomId));
  return `${base.replace(/\/+$/, '')}/${encodeURIComponent(roomId)}`;
}

class OnlineRoomClient {
  constructor({ roomId, settings, onStatus, onMessage }) {
    this.roomId = roomId;
    this.settings = settings;
    this.onStatus = onStatus;
    this.onMessage = onMessage;
    this.socket = null;
    this.retryCount = 0;
    this.retryTimer = null;
    this.heartbeat = null;
    this.closedByUser = false;
    this.clientId = getOrCreateClientId();
    this.tokenKey = `bear-frog-chess:room-token:${roomId}`;
  }

  getReconnectToken() {
    try {
      return window.localStorage.getItem(this.tokenKey);
    } catch (error) {
      return null;
    }
  }

  saveReconnectToken(token) {
    if (!token) return;
    try {
      window.localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      // Reconnect simply becomes unavailable when storage is disabled.
    }
  }

  updateSettings(settings) {
    this.settings = settings;
  }

  connect() {
    clearTimeout(this.retryTimer);
    this.onStatus(this.retryCount > 0 ? 'reconnecting' : 'connecting');
    const socket = new WebSocket(getRoomWebSocketUrl(this.roomId));
    this.socket = socket;

    socket.onopen = () => {
      if (this.socket !== socket) return;
      this.retryCount = 0;
      this.onStatus('online');
      this.send({
        type: 'join',
        protocol: PROTOCOL_VERSION,
        roomId: this.roomId,
        clientId: this.clientId,
        reconnectToken: this.getReconnectToken(),
        names: this.settings.names,
        pieces: this.settings.pieces,
      });
      clearInterval(this.heartbeat);
      this.heartbeat = setInterval(() => this.send({ type: 'ping' }), 20000);
    };

    socket.onmessage = (event) => {
      if (this.socket !== socket) return;
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (error) {
        this.onMessage({ type: 'error', code: 'invalid_server_message', message: '服务器消息无法解析' });
        return;
      }
      if (message.type === 'welcome') this.saveReconnectToken(message.reconnectToken);
      this.onMessage(message);
    };

    socket.onerror = () => {
      if (this.socket === socket) this.onStatus('reconnecting');
    };

    socket.onclose = (event) => {
      if (this.socket !== socket) return;
      clearInterval(this.heartbeat);
      if (this.closedByUser || event.code === 4001) {
        this.onStatus(event.code === 4001 ? 'replaced' : 'offline');
        return;
      }
      this.scheduleReconnect();
    };
  }

  scheduleReconnect() {
    this.onStatus('reconnecting');
    const delay = RETRY_DELAYS[Math.min(this.retryCount, RETRY_DELAYS.length - 1)];
    this.retryCount += 1;
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.connect(), delay);
  }

  send(payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }

  move(from, to, revision) {
    return this.send({ type: 'move', from, to, revision });
  }

  updateProfile(name, piece) {
    return this.send({ type: 'profile', name, piece });
  }

  rematch() {
    return this.send({ type: 'rematch' });
  }

  sync() {
    return this.send({ type: 'sync' });
  }

  close() {
    this.closedByUser = true;
    clearTimeout(this.retryTimer);
    clearInterval(this.heartbeat);
    if (this.socket) this.socket.close(1000, 'Leaving room');
  }
}

const onlineClientModule = {
  OnlineRoomClient,
  getRoomWebSocketUrl,
  normalizeWebSocketBase,
};

export {
  OnlineRoomClient,
  getRoomWebSocketUrl,
  normalizeWebSocketBase,
};

export default onlineClientModule;
