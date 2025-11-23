import {
  createStore, combineReducers, applyMiddleware, compose,
} from 'redux';

import { reducer as playerReducer } from './player';
import { reducer as chessBoardReducer } from './chessBoard';
import { reducer as gameControlReducer } from './gameControl';
import { getInitState } from './utils';

const win = window;

const reducer = combineReducers({
  player: playerReducer,
  chessBoard: chessBoardReducer,
  gameControl: gameControlReducer,
});

const middlewares = [];
if (process.env.NODE_ENV !== 'production') {
  middlewares.push(require('redux-immutable-state-invariant').default());
}

const storeEnhancers = compose(
  applyMiddleware(...middlewares),
  (win && win.devToolsExtension) ? win.devToolsExtension() : (f) => f,
);

export default createStore(reducer, getInitState(), storeEnhancers);
