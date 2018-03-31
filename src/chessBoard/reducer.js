import {SELECT, MOVE_TO}from './actionTypes.js';
import {findChessPos} from '../utils';

export default (state = {}, action) => {
    switch (action.type) {
        case SELECT: {
            console.log(action);
            return {
                ...state,
                ['selected']: true,
                ['selectId']: action.id
            }
        }
        case MOVE_TO: {
            const now = findChessPos(state.board, state.selectId);
            const {x, y} = findChessPos(state.board, action.id);
            console.log(now.x, now.y, x, y, state.selectId, action.id, state.board);
            const newBoard = state.board.map((row) =>
                row.map((item) => {
                        return {...item}
                    }
                )
            );
            const temp = newBoard[now.x][now.y];
            newBoard[now.x][now.y] = newBoard[x][y];
            newBoard[x][y] = temp;
            return {
                ...state,
                ['board']: newBoard,
                ['selected']: false,
            }
        }
        case SELECT: {
            return state.filter((todoItem) => {
                return todoItem.id !== action.id;
            })
        }
        default: {
            return state;
        }
    }
}
