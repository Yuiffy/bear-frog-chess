import {ChessTypes} from "../constants";
import {findChessPos} from "./index";

export const flatten = arr => arr.reduce((pre, val) => pre.concat(Array.isArray(val) ? flatten(val) : val), []);

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
  newBoard[now.x][now.y].player = player; //因为目前的动画会根据棋子的player来画棋子，死亡动画要用到这个空格，所以这里要打个这个补丁。虽然不太合适
  doKill(newBoard, x, y, player);
  return newBoard;
}


export function judgeGameOver(board, player = {
  players: [{name: 'A'}, {name: 'B'}],
  order: [0, 1]
}, orderSequence = [0, 1]) {
  const flatBoard = flatten(board);

  const playerChessCount = {...orderSequence};
  for (const key in playerChessCount) playerChessCount[key] = 0;
  for (const i in flatBoard) {
    flatBoard[i].type=== ChessTypes.NORMAL && playerChessCount[flatBoard[i].player]++;
  }

  const {players, order} = player;
  let gameOver = false;
  let winners = [];
  // 判断是否只剩1棋，输掉
  for (const key in playerChessCount) {
    if (playerChessCount[key] <= 1) {
      gameOver = true;
    } else if (players[parseInt(key)]) winners.push(players[parseInt(key)].name);
  }
  if (!gameOver) {
    // 判断是否无棋可走，输掉
    winners = [];
    const playerCanMoveCount = {...order};
    for (const key in playerCanMoveCount) playerCanMoveCount[key] = {};
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j].type === ChessTypes.NORMAL) {
          const moveList = getNextPosList(board, i, j);
          const player = board[i][j].player;
          moveList.forEach((id) => {
            playerCanMoveCount[player][id] = true;
          });
        }
      }
    }

    const overs = {};
    for (const key in playerCanMoveCount) {
      if (Object.keys(playerCanMoveCount[key]) <= 0) {
        gameOver = true;
        if (players[parseInt(key)]) overs[key] = true;
      }
    }
    if (gameOver)
      for (const key in playerCanMoveCount) {
        console.log(key, playerCanMoveCount[key], overs[key]);
        if (players[parseInt(key)] && !overs[key]) winners.push(players[parseInt(key)].name);
      }
    console.log("playerCanMoveCount", board, playerCanMoveCount, overs);
  }
  return {
    gameOver,
    winners
  };
}
