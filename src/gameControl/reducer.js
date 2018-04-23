import {RESET, UPDATE_SOCKET} from './actionTypes.js';
import {ChessTypes} from '../constants.js'
import {getInitState} from '../utils/';

export default (state = ChessTypes.NONE, action) => {
    switch (action.type) {
        case RESET: {
            console.log("RESET!", getInitState());
            return getInitState();
        }
        case UPDATE_SOCKET: {
            console.log("UPDATE_SOCKET!", action.socketClient);
            const {socketClient} = action;
            return {
                ...state,
                socketClient
            }
        }
        default:
            return state;
    }
}
