import {createStore, combineReducers, applyMiddleware, compose} from 'redux';

import {reducer as playerReducer} from './player';
import {reducer as chessBoardReducer} from './chessBoard';
import {reducer as gameControlReducer} from './gameControl';
import {ChessTypes} from './constants.js';

const win = window;

const reducer = combineReducers({
    player: playerReducer,
    chessBoard: chessBoardReducer,
    gameControl: gameControlReducer
});

let chessId = 0;
const createChess = (player, chessType) => {
    return {
        id: chessId++,
        player: player,
        type: chessType
    }
};

const createBearFrogBoard = () => {
    const board = [
        [createChess(1, ChessTypes.NORMAL), createChess(1, ChessTypes.NORMAL), createChess(1, ChessTypes.NORMAL), createChess(1, ChessTypes.NORMAL)],
        [createChess(1, ChessTypes.NORMAL), createChess(null, ChessTypes.NONE), createChess(null, ChessTypes.NONE), createChess(1, ChessTypes.NORMAL)],
        [createChess(0, ChessTypes.NORMAL), createChess(null, ChessTypes.NONE), createChess(null, ChessTypes.NONE), createChess(0, ChessTypes.NORMAL)],
        [createChess(0, ChessTypes.NORMAL), createChess(0, ChessTypes.NORMAL), createChess(0, ChessTypes.NORMAL), createChess(0, ChessTypes.NORMAL)]
    ];
    return board;
};
const initValues = {
    player: {
        players: [
            {
                name: "你"
            },
            {
                name: "敌人"
            }
        ],
        local: [0, 1],
        nowPlayer: 0
    },
    chessBoard: {
        board: createBearFrogBoard(),
        selected: false,
        selectId: -1
    },
    gameControl: {}
};

const middlewares = [];
if (process.env.NODE_ENV !== 'production') {
    middlewares.push(require('redux-immutable-state-invariant').default());
}

const storeEnhancers = compose(
    applyMiddleware(...middlewares),
    (win && win.devToolsExtension) ? win.devToolsExtension() : (f) => f,
);

export default createStore(reducer, initValues, storeEnhancers);
