const BOARD_SIZE = 4;
const EMPTY = null;
const PLAYING = 'playing';
const FINISHED = 'finished';

const ORTHOGONAL_DIRECTIONS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function createInitialBoard() {
  return [
    [1, 1, 1, 1],
    [1, EMPTY, EMPTY, 1],
    [0, EMPTY, EMPTY, 0],
    [0, 0, 0, 0],
  ];
}

function createInitialGame(startingPlayer = 0) {
  return {
    board: createInitialBoard(),
    turn: startingPlayer,
    status: PLAYING,
    winner: null,
    endReason: null,
    moveNumber: 0,
    lastMove: null,
  };
}

function cloneBoard(board) {
  return board.map((row) => row.slice());
}

function isInside(position) {
  return position
    && Number.isInteger(position.row)
    && Number.isInteger(position.col)
    && position.row >= 0
    && position.row < BOARD_SIZE
    && position.col >= 0
    && position.col < BOARD_SIZE;
}

function samePosition(left, right) {
  return left.row === right.row && left.col === right.col;
}

function getLegalDestinations(board, from) {
  if (!isInside(from) || board[from.row][from.col] === EMPTY) return [];

  return ORTHOGONAL_DIRECTIONS
    .map(([rowDelta, colDelta]) => ({
      row: from.row + rowDelta,
      col: from.col + colDelta,
    }))
    .filter((position) => isInside(position) && board[position.row][position.col] === EMPTY);
}

function listLegalMoves(game, player = game.turn) {
  if (!game || !Array.isArray(game.board) || game.status === FINISHED) return [];

  const moves = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (game.board[row][col] === player) {
        const from = { row, col };
        getLegalDestinations(game.board, from).forEach((to) => moves.push({ from, to }));
      }
    }
  }
  return moves;
}

function validateMove(game, move, player = game && game.turn) {
  if (!game || game.status !== PLAYING) return { valid: false, reason: 'game_finished' };
  if (!move || !isInside(move.from) || !isInside(move.to)) {
    return { valid: false, reason: 'outside_board' };
  }
  if (player !== game.turn) return { valid: false, reason: 'not_your_turn' };
  if (game.board[move.from.row][move.from.col] !== player) {
    return { valid: false, reason: 'not_your_piece' };
  }
  if (game.board[move.to.row][move.to.col] !== EMPTY) {
    return { valid: false, reason: 'destination_occupied' };
  }

  const legal = getLegalDestinations(game.board, move.from)
    .some((position) => samePosition(position, move.to));
  return legal
    ? { valid: true, reason: null }
    : { valid: false, reason: 'not_adjacent' };
}

function getOccupiedRun(board, position, rowDelta, colDelta) {
  let start = { ...position };
  let previous = { row: start.row - rowDelta, col: start.col - colDelta };
  while (isInside(previous) && board[previous.row][previous.col] !== EMPTY) {
    start = previous;
    previous = { row: start.row - rowDelta, col: start.col - colDelta };
  }

  const run = [];
  let cursor = start;
  while (isInside(cursor) && board[cursor.row][cursor.col] !== EMPTY) {
    run.push({ ...cursor });
    cursor = { row: cursor.row + rowDelta, col: cursor.col + colDelta };
  }
  return run;
}

function collectCaptures(board, destination, player) {
  const captures = [];
  const axes = [[0, 1], [1, 0]];

  axes.forEach(([rowDelta, colDelta]) => {
    const run = getOccupiedRun(board, destination, rowDelta, colDelta);
    if (run.length !== 3) return;

    const friendlyIndexes = [];
    const enemyPositions = [];
    run.forEach((position, index) => {
      if (board[position.row][position.col] === player) friendlyIndexes.push(index);
      else enemyPositions.push(position);
    });

    const friendlyPair = friendlyIndexes.length === 2
      && Math.abs(friendlyIndexes[0] - friendlyIndexes[1]) === 1;
    if (friendlyPair && enemyPositions.length === 1) captures.push(enemyPositions[0]);
  });

  return captures.filter((position, index) => (
    captures.findIndex((item) => samePosition(item, position)) === index
  ));
}

function countPieces(board) {
  const counts = [0, 0];
  board.forEach((row) => row.forEach((cell) => {
    if (cell === 0 || cell === 1) counts[cell] += 1;
  }));
  return counts;
}

function getOutcome(board, nextPlayer) {
  const counts = countPieces(board);
  if (counts[nextPlayer] <= 1) {
    return { winner: 1 - nextPlayer, reason: 'pieces' };
  }

  const probe = {
    board,
    turn: nextPlayer,
    status: PLAYING,
  };
  if (listLegalMoves(probe, nextPlayer).length === 0) {
    return { winner: 1 - nextPlayer, reason: 'blocked' };
  }
  return null;
}

function applyMove(game, move, player = game && game.turn) {
  const validation = validateMove(game, move, player);
  if (!validation.valid) {
    const error = new Error(validation.reason);
    error.code = validation.reason;
    throw error;
  }

  const board = cloneBoard(game.board);
  board[move.from.row][move.from.col] = EMPTY;
  board[move.to.row][move.to.col] = player;

  const captured = collectCaptures(board, move.to, player);
  captured.forEach((position) => {
    board[position.row][position.col] = EMPTY;
  });

  const nextPlayer = 1 - player;
  const outcome = getOutcome(board, nextPlayer);
  return {
    ...game,
    board,
    turn: outcome ? player : nextPlayer,
    status: outcome ? FINISHED : PLAYING,
    winner: outcome ? outcome.winner : null,
    endReason: outcome ? outcome.reason : null,
    moveNumber: game.moveNumber + 1,
    lastMove: {
      from: { ...move.from },
      to: { ...move.to },
      player,
      captured,
    },
  };
}

function positionToLabel(position) {
  return `${String.fromCharCode(65 + position.col)}${BOARD_SIZE - position.row}`;
}

function boardKey(game) {
  return `${game.turn}:${game.board.flat().map((cell) => (cell === EMPTY ? '-' : cell)).join('')}`;
}

module.exports = {
  BOARD_SIZE,
  EMPTY,
  FINISHED,
  PLAYING,
  applyMove,
  boardKey,
  cloneBoard,
  collectCaptures,
  countPieces,
  createInitialBoard,
  createInitialGame,
  getLegalDestinations,
  getOutcome,
  isInside,
  listLegalMoves,
  positionToLabel,
  samePosition,
  validateMove,
};
