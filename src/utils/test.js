/**
 * Created by yuiff on 2018/4/2.
 */
const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:3000/ws');

ws.on('open', () => {
  console.log('???');
  ws.send('something');
});

ws.on('message', (data) => {
  console.log(data);
});
