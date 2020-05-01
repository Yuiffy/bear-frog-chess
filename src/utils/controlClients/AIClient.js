// const host = 'http://localhost:3000';
// const socketPath = '/socket';

import AI from "../ai/ai";
import {judgeGameOver} from "../boardUtils";

export default class AIClient {
  funcs = {
    onMessage: () => {
    },
    onOpen: () => {
    }
  }
  store = {
    timeout: 0
  }

  connect(host) {
    const data = {};
    // this.funcs.onOpen(data);
  }

  disconnect() {
    clearTimeout(this.store.timeout)
  }

  send(data) {
    // this.ws.send(JSON.stringify(data));
    console.log("AIClient send", data);
    clearTimeout(this.store.timeout);
    this.store.timeout = setTimeout(() => {
      const {nowPlayer, isRoundEnd} = data; // nowPlayer好像经常是null，那边没好好传过来，待修复

      if (judgeGameOver(data.board).gameOver) return; //游戏已经结束的话，就不用计算了

      const realNowPlayer = nowPlayer === null ? 1 : nowPlayer;
      const newNowPlayer = realNowPlayer ? 0 : 1;
      const resData = {
        board: AI.getNextBoard(data.board, realNowPlayer),
        isRoundEnd: false,
        needMessage: false,
        nowPlayer: newNowPlayer
      };
      this.funcs.onMessage({data: JSON.stringify(resData)});
    }, 1000);
  }

  setOnMessage(func) {
    // this.ws.onmessage = func;
    this.funcs.onMessage = func;
  }

  setOnOpen(func) {
    // this.ws.onopen = func;
    this.funcs.onOpen = func;
  }
}
