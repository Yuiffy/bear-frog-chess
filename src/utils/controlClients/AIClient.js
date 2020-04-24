// const host = 'http://localhost:3000';
// const socketPath = '/socket';

import AI from "../ai/ai";

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
      const resData = {
        board: AI.getNextBoard(data.board),
        isRoundEnd: false,
        needMessage: false,
        nowPlayer: 0
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
