// const host = 'http://localhost:3000';
// const socketPath = '/socket';

import AI from "../ai/ai";
import {judgeGameOver} from "../boardUtils";

export default class AIClient {
  funcs={
    onMessage: ()=>{},
    onOpen: ()=>{}
  }
  connect(host) {
    const data = {};
    // this.funcs.onOpen(data);
  }

  disconnect() {

  }

  send(data) {
    // this.ws.send(JSON.stringify(data));
    console.log("AIClient send", data);
    setTimeout(()=>{
      const {nowPlayer, isRoundEnd} = data; // nowPlayer好像经常是null，那边没好好传过来，待修复

      if(judgeGameOver(data.board).gameOver) return; //游戏已经结束的话，就不用计算了

      const realNowPlayer = 1;
      const newNowPlayer = 0;
      const resData = {
        board: AI.getNextBoard(data.board, 1),
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
