// const host = 'http://localhost:3000';
// const socketPath = '/socket';

export default class SocketAPI {
  ws;

  connect(host) {
    this.ws = new WebSocket(host);
    this.ws.onclose = (e) => {
      alert('webSocket onClose!' + e);
    };
    this.ws.onerror = (e) => {
      alert('webSocket onError!' + e);
    };
  }

  disconnect() {
    this.ws.disconnect();//待确认，乱写的
  }

  send(data) {
    this.ws.send(JSON.stringify(data));
  }

  setOnMessage(func) {
    this.ws.onmessage = func;
  }

  setOnOpen(func) {
    this.ws.onopen = func;
  }

  // on(event, fun) {
  //     // No promise is needed here, but we're expecting one in the middleware.
  //     return new Promise((resolve, reject) => {
  //         if (!this.socket) return reject('No socket connection.');
  //
  //         this.socket.on(event, fun);
  //         resolve();
  //     });
  // }
}

const gameMessage = (board, nowPlayer, isRoundEnd = false, needMessage = false) => {
  return {
    board,
    nowPlayer,
    isRoundEnd,
    needMessage
  };
};

export { gameMessage };
