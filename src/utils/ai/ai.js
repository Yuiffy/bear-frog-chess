import {doMoveAction, getNextPosList} from "../boardUtils";
import {ChessTypes} from "../../constants";
import {findChessPos} from "../index";

const flatten = arr => arr.reduce((pre, val) => pre.concat(Array.isArray(val) ? flatten(val) : val), []);

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const AI = {
  getTheMove: function (board, player) {
    const moves = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j].type === ChessTypes.NORMAL && board[i][j].player === player) {
          const moveList = getNextPosList(board, i, j);
          moveList.forEach(one => {
            moves.push({now: board[i][j].id, next: one}); //存现在的和next的id
          })
        }
      }
    }

    const theMove = moves[getRandomInt(0, moves.length - 1)];
    return theMove;
  },
  getNextBoard: (board, player) => {
    //id: 16, player: 1, type: "有棋"
    //{id: 25, player: null, type: "无棋"}
    console.log("AI getNextBoard board?!", board, player);

    // const flatBoard = flatten(board);
    // const canMoveChesses = flatBoard.filter(one=>one.player===player);
    const theMove = AI.getTheMove(board, player);

    let newBoard = board;
    if(theMove){
      const now = findChessPos(board, theMove.now);
      const next = findChessPos(board, theMove.next);
      console.log("getNextBoard theMove", theMove, now, next);
      newBoard = doMoveAction(board, now, next.x, next.y);
    }

    return newBoard;
  }
};

export default AI;
