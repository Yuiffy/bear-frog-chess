const {
  applyMove,
  boardKey,
  countPieces,
  listLegalMoves,
} = require('./rules');

const DIFFICULTY_DEPTH = {
  relaxed: 1,
  smart: 4,
};

function evaluate(game, player) {
  if (game.status === 'finished') {
    return game.winner === player ? 100000 - game.moveNumber : -100000 + game.moveNumber;
  }

  const counts = countPieces(game.board);
  const material = (counts[player] - counts[1 - player]) * 120;
  const ownMobility = listLegalMoves(game, player).length;
  const enemyMobility = listLegalMoves(game, 1 - player).length;
  const mobility = (ownMobility - enemyMobility) * 8;

  let centerControl = 0;
  game.board.forEach((row, rowIndex) => row.forEach((cell, colIndex) => {
    if (cell === null) return;
    const distance = Math.abs(1.5 - rowIndex) + Math.abs(1.5 - colIndex);
    const value = 3 - distance;
    centerControl += cell === player ? value : -value;
  }));

  return material + mobility + centerControl;
}

function orderedChildren(game) {
  return listLegalMoves(game).map((move) => {
    const next = applyMove(game, move);
    return { move, next, captureCount: next.lastMove.captured.length };
  }).sort((left, right) => right.captureCount - left.captureCount);
}

function minimax(game, depth, alpha, beta, maximizingPlayer, cache) {
  if (depth === 0 || game.status === 'finished') return evaluate(game, maximizingPlayer);

  const cacheKey = `${boardKey(game)}:${depth}:${maximizingPlayer}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const maximize = game.turn === maximizingPlayer;
  let best = maximize ? -Infinity : Infinity;
  const children = orderedChildren(game);

  for (let index = 0; index < children.length; index += 1) {
    const score = minimax(children[index].next, depth - 1, alpha, beta, maximizingPlayer, cache);
    if (maximize) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }

  cache.set(cacheKey, best);
  return best;
}

function chooseAiMove(game, player, difficulty = 'smart', random = Math.random) {
  if (!game || game.status === 'finished' || game.turn !== player) return null;
  const legalMoves = listLegalMoves(game, player);
  if (legalMoves.length === 0) return null;

  if (difficulty === 'relaxed') {
    return legalMoves[Math.floor(random() * legalMoves.length)];
  }

  const depth = DIFFICULTY_DEPTH[difficulty] || DIFFICULTY_DEPTH.smart;
  const cache = new Map();
  let bestScore = -Infinity;
  let bestMove = legalMoves[0];

  orderedChildren(game).forEach(({ move, next }) => {
    const score = minimax(next, depth - 1, -Infinity, Infinity, player, cache);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  });

  return bestMove;
}

module.exports = {
  chooseAiMove,
  evaluate,
};
