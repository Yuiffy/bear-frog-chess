/**
 * Created by yuiff on 2018/3/31.
 */
import { ChessTypes } from '../constants.js';

const findChessPos = (board, chessId) => {
  let selectPos = {};
  for (let i = 0; i < board.length; i++) {
    const row = board[i];
    for (let j = 0; j < row.length; j++) {
      // console.log(typeof(i), typeof(j));
      const item = row[j];
      if (item.id === chessId) {
        selectPos = {
          x: i,
          y: j,
        };
        break;
      }
    }
  }
  // console.log(selectPos, chessId, board, typeof(selectPos.x), typeof(selectPos.y));
  return selectPos;
};

let chessId = 0;
const createChess = (player, chessType) => ({
  id: chessId++,
  player,
  type: chessType,
});

const createBearFrogBoard = () => {
  const board = [
    [createChess(1, ChessTypes.NORMAL), createChess(1, ChessTypes.NORMAL), createChess(1, ChessTypes.NORMAL), createChess(1, ChessTypes.NORMAL)],
    [createChess(1, ChessTypes.NORMAL), createChess(null, ChessTypes.NONE), createChess(null, ChessTypes.NONE), createChess(1, ChessTypes.NORMAL)],
    [createChess(0, ChessTypes.NORMAL), createChess(null, ChessTypes.NONE), createChess(null, ChessTypes.NONE), createChess(0, ChessTypes.NORMAL)],
    [createChess(0, ChessTypes.NORMAL), createChess(0, ChessTypes.NORMAL), createChess(0, ChessTypes.NORMAL), createChess(0, ChessTypes.NORMAL)],
  ];
  return board;
};

const getInitState = () => {
  const initValues = {
    player: {
      players: [
        {
          name: '黑方',
        },
        {
          name: '红方',
        },
      ],
      order: [0, 1],
      local: [0, 1],
      nowPlayer: 0,
    },
    chessBoard: {
      board: createBearFrogBoard(),
      selected: false,
      selectId: -1,
    },
    gameControl: {
    },
  };
  return initValues;
};

class SocketContainerClass{
  constructor(){
    this.socketClient = null;
    this.setSocketClient = this.setSocketClient.bind(this);
    this.getSocketClient = this.getSocketClient.bind(this);
  }
  setSocketClient(s) {
    this.socketClient = s;
  }
  getSocketClient () {return this.socketClient}
}

const socketContainer = new SocketContainerClass();

export { findChessPos, createBearFrogBoard, getInitState, socketContainer };
