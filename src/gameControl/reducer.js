import {RESET} from './actionTypes.js';
import {ChessTypes} from '../constants.js'
import {getInitState} from '../utils/';

export default (state = ChessTypes.NONE, action) => {
  switch(action.type) {
    case RESET: {
        console.log("RESET!", getInitState());
      return getInitState();
    }
    default:
      return state;
  }
}
