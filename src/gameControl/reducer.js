import { RESET, UPDATE_SOCKET } from './actionTypes.js';
import { ChessTypes } from '../constants.js';
import { getInitState } from '../utils/';

export default (state = ChessTypes.NONE, action) => {
  switch (action.type) {
    case RESET: {
      //好像写的不对，也没用上
      console.log('RESET!', getInitState());
      return getInitState();
    }
    case UPDATE_SOCKET: {
      //这个好像，也没用上，这个东西都不放在store里了
      console.log('UPDATE_SOCKET!', action.socketClient);
      const { socketClient } = action;
      return {
        ...state,
        socketClient,
      };
    }
    default:
      return state;
  }
};
