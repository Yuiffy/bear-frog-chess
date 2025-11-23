// const host = 'http://localhost:3000';
// const socketPath = '/socket';

export default class SocketAPI {
  constructor() {
    this.ws = null;
  }

  connect(host) {
    this.ws = new WebSocket(host);
    this.ws.onclose = (e) => {
      if (!e.isTrusted) {
        alert(`webSocket onClose!${JSON.stringify(e)}`);
      }
    };
    this.ws.onerror = (e) => {
      alert(`webSocket onError!${e}`);
    };
  }

  disconnect() {
    this.ws.close(1000, '正常关闭'); // 待确认，乱写的
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
// board棋盘，nowPlayer当前回合人（0/1）， isRoundEnd不懂是啥，needMessage是否需要立刻获取棋盘信息，例如刚上线首次获取棋盘的在线人
const gameMessage = (board, nowPlayer, isRoundEnd = false, needMessage = false) => ({
  board,
  nowPlayer,
  isRoundEnd,
  needMessage,
});

export { gameMessage };
