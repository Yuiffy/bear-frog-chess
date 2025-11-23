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
          name: '熊方',
        },
        {
          name: '蛙方',
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

class SocketContainerClass {
  constructor() {
    this.socketClient = null;
    this.setSocketClient = this.setSocketClient.bind(this);
    this.getSocketClient = this.getSocketClient.bind(this);
  }

  setSocketClient(s) {
    this.socketClient = s;
  }

  getSocketClient() { return this.socketClient; }
}

const socketContainer = new SocketContainerClass();

/**
 * 根据当前页面协议（http/https）动态构建 WebSocket URL
 * @param {string} host - WebSocket 主机和路径（不包含协议，例如：example.com:3000/ws 或 //example.com:3000/ws）
 * @returns {string} - 完整的 WebSocket URL（ws:// 或 wss://）
 */
const getWebSocketUrl = (host) => {
  // 获取当前页面协议（http: 或 https:）
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

  // 如果 host 已经包含 //，直接拼接协议
  // 否则添加 //
  const normalizedHost = host.startsWith('//') ? host : `//${host}`;

  return `${protocol}${normalizedHost}`;
};

export {
  findChessPos, createBearFrogBoard, getInitState, socketContainer, getWebSocketUrl,
};
