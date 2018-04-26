import { SET_LOCAL_PLAYER, ROUND_END } from './actionTypes.js';


export default (state = {}, action) => {
  switch (action.type) {
    case ROUND_END: {
      const newState = {
        ...state,
        nowPlayer: state.order[(state.order.indexOf(state.nowPlayer) + 1) % state.order.length],
      };
      return newState;
    }
    case SET_LOCAL_PLAYER: {
      const nextState = {
        ...state,
        nowPlayer: action.nowPlayer ? action.nowPlayer : 0,
      };
      if (action.local) { nextState.local = action.local; }
      return nextState;
    }
    default: {
      return state;
    }
  }
};
