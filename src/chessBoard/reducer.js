import { SELECT, MOVE_TO, SET_BOARD } from './actionTypes.js';
import { findChessPos, socketContainer, createBearFrogBoard } from '../utils';
import { ChessTypes } from '../constants.js';
import { gameMessage } from '../utils/controlClients/SocketClient';
import { doMoveAction } from '../utils/boardUtils';

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
      const { board } = state;
      console.log(now.x, now.y, x, y, state.selectId, action.id, state.board);
      const newBoard = doMoveAction(board, now, x, y);
      if (socketContainer.getSocketClient()) {
        socketContainer.getSocketClient()
          .send(gameMessage(newBoard, null, true));
      }
      return {
        ...state,
        board: newBoard,
        selected: false,
      };
    }
    case SELECT: {
      return state.filter((todoItem) => todoItem.id !== action.id);
    }
    case SET_BOARD: {
      console.log('SET_BOARD!REDUCER, got action:', action);
      let newBoard = action.board;
      if (!newBoard) {
        newBoard = createBearFrogBoard();
        // 如果打AI的话，要这样发新的棋盘给AI让它动一下，否则会两边都没法动。这个临时在这加着，应该有更好的实现方式。
        if (socketContainer.getSocketClient()) {
          socketContainer.getSocketClient()
            .send(gameMessage(newBoard, null, true));
        }
      }
      return {
        ...state,
        board: newBoard,
      };
    }
    default: {
      return state;
    }
  }
};
