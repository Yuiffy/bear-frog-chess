import { SELECT, MOVE_TO, SET_BOARD } from './actionTypes.js';
import { findChessPos, socketContainer } from '../utils';
import { ChessTypes } from '../constants.js';
import { createBearFrogBoard } from '../utils/';

function doKill(board, x, y, player) {
  for (let isHorizon = 0; isHorizon < 2; isHorizon++) {
    let maxX = board.length;
    let maxY = board[0].length;
    if (isHorizon) [maxX, maxY] = [maxY, maxX];
    const ii = isHorizon ? x : y;

    let allLength = 0,
      maxAllLength = 0;
    let selfLength = 0,
      maxSelfLength = 0,
      selfSize = 0;
    const enemyList = [];
    for (let jj = 0; jj < maxY; jj++) {
      const [i, j] = isHorizon ? [ii, jj] : [jj, ii];
      const now = board[i][j];
      if (now.type != ChessTypes.NONE) {
        allLength++;
        maxAllLength = Math.max(allLength, maxAllLength);
        if (now.player === player) {
          selfLength++;
          maxSelfLength = Math.max(selfLength, maxSelfLength);
          selfSize++;
        } else {
          enemyList.push(now);
          selfLength = 0;
        }
      } else {
        allLength = 0;
        selfLength = 0;
      }
    }
    if (maxAllLength == 3 && maxSelfLength == 2 && selfSize == 2 && enemyList.length == 1) {
      for (let j = 0; j < enemyList.length; j++) {
        enemyList[j].type = ChessTypes.NONE;
        enemyList[j].player = -1;
      }
    }
  }
}

export default (state = {}, action) => {
  switch (action.type) {
    case SELECT: {
      console.log(action);
      return {
        ...state,
        selected: true,
        selectId: action.id,
      };
    }
    case MOVE_TO: {
      const now = findChessPos(state.board, state.selectId);
      const { x, y } = findChessPos(state.board, action.id);
      console.log(now.x, now.y, x, y, state.selectId, action.id, state.board);
      const newBoard = state.board.map(row =>
        row.map(item => ({ ...item })));
      const temp = newBoard[now.x][now.y];
      newBoard[now.x][now.y] = newBoard[x][y];
      newBoard[x][y] = temp;
      const player = newBoard[x][y].player;
      doKill(newBoard, x, y, player);
      if (socketContainer.getSocketClient()) { socketContainer.getSocketClient().send(newBoard); }
      return {
        ...state,
        board: newBoard,
        selected: false,
      };
    }
    case SELECT: {
      return state.filter(todoItem => todoItem.id !== action.id);
    }
    case SET_BOARD: {
      console.log('SET_BOARD!REDUCER, got action:', action);
      const board = action.board ? action.board : createBearFrogBoard();
      return {
        ...state,
        board,
      };
    }
    default: {
      return state;
    }
  }
};
