import {ChessTypes} from "../constants";
import {findChessPos} from "./index";

export function getNextPosList(board, x, y) {
  const maxX = board.length;
  const maxY = board[0].length;
  const gx = [0, 0, -1, 1];
  const gy = [1, -1, 0, 0];
  const moveList = [];
  for (const i in gx) {
    const x2 = x + gx[i];
    const y2 = y + gy[i];
    // console.log(x, y, gx[i], gy[i], x2, y2, maxX, maxY, typeof(x), typeof(gx[i]));
    if (x2 >= 0 && x2 < maxX && y2 >= 0 && y2 < maxY && board[x2][y2].type === ChessTypes.NONE) {
      moveList.push(board[x2][y2].id);
    }
  }
  return moveList;
}


export const judgeCanBeMoveTo = ({board, selectId, selected}, chessId) => {
  if (!selected) return false;
  const {x, y} = findChessPos(board, selectId);
  const moveList = getNextPosList(board, x, y);
  // console.log(moveList.indexOf(chessId) !== -1);
  return moveList.indexOf(chessId) !== -1;
};

export function doKill(board, x, y, player) {
  for (let isHorizon = 0; isHorizon < 2; isHorizon++) {
    let maxX = board.length;
    let maxY = board[0].length;
    if (isHorizon) [maxX, maxY] = [maxY, maxX];
    const ii = isHorizon ? x : y;

    let allLength = 0,
      maxAllLength = 0;
    let selfLength = 0,
      maxSelfLength = 0,
      selfSize = 0;
    const enemyList = [];
    for (let jj = 0; jj < maxY; jj++) {
      const [i, j] = isHorizon ? [ii, jj] : [jj, ii];
      const now = board[i][j];
      if (now.type != ChessTypes.NONE) {
        allLength++;
        maxAllLength = Math.max(allLength, maxAllLength);
        if (now.player === player) {
          selfLength++;
          maxSelfLength = Math.max(selfLength, maxSelfLength);
          selfSize++;
        } else {
          enemyList.push(now);
          selfLength = 0;
        }
      } else {
        allLength = 0;
        selfLength = 0;
      }
    }
    if (maxAllLength == 3 && maxSelfLength == 2 && selfSize == 2 && enemyList.length == 1) {
      for (let j = 0; j < enemyList.length; j++) {
        enemyList[j].type = ChessTypes.NONE;
        enemyList[j].typeChangeInfo = {reason: "DIE"};
        enemyList[j].player = -1;
      }
    }
  }
}

// 从now: {x,y}移动一个棋到x,y，计算kill操作
export function doMoveAction(board, now, x, y) {
  const newBoard = board.map(row =>
    row.map(item => ({...item})));
  // (now.x,now.y) move to x,y
  const temp = newBoard[now.x][now.y];
  newBoard[now.x][now.y] = newBoard[x][y];
  newBoard[x][y] = temp;

  newBoard[now.x][now.y].typeChangeInfo = {reason: "LEAVE", x, y};
  newBoard[x][y].typeChangeInfo = {reason: "ARRIVE", x: now.x, y: now.y};

  const player = newBoard[x][y].player;
  doKill(newBoard, x, y, player);
  return newBoard;
}
