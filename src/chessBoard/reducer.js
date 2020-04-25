import {SELECT, MOVE_TO, SET_BOARD} from './actionTypes.js';
import {findChessPos, socketContainer} from '../utils';
import {ChessTypes} from '../constants.js';
import {createBearFrogBoard} from '../utils/';
import {gameMessage} from '../utils/controlClients/SocketClient';
import {doMoveAction} from "../utils/boardUtils";

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
      const {x, y} = findChessPos(state.board, action.id);
      const board = state.board;
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
