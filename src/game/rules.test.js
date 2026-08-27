const {
  applyMove,
  collectCaptures,
  createInitialGame,
  listLegalMoves,
  validateMove,
} = require('./rules');
const { chooseAiMove } = require('./ai');

describe('Bear Frog Chess rules', () => {
  test('starts with six pieces per side and four legal opening moves', () => {
    const game = createInitialGame();
    expect(game.board.flat().filter((cell) => cell === 0)).toHaveLength(6);
    expect(game.board.flat().filter((cell) => cell === 1)).toHaveLength(6);
    expect(listLegalMoves(game)).toHaveLength(4);
  });

  test('only permits an orthogonal move into an empty neighbor', () => {
    const game = createInitialGame();
    expect(validateMove(game, {
      from: { row: 2, col: 0 },
      to: { row: 2, col: 1 },
    })).toEqual({ valid: true, reason: null });
    expect(validateMove(game, {
      from: { row: 2, col: 0 },
      to: { row: 1, col: 1 },
    }).reason).toBe('not_adjacent');
  });

  test('captures an enemy next to a two-piece cannon', () => {
    const board = [
      [null, 0, null, null],
      [0, null, 1, null],
      [null, null, 0, 1],
      [1, 1, 0, 0],
    ];
    const game = { ...createInitialGame(), board };
    const next = applyMove(game, {
      from: { row: 0, col: 1 },
      to: { row: 1, col: 1 },
    });
    expect(next.board[1][2]).toBeNull();
    expect(next.lastMove.captured).toEqual([{ row: 1, col: 2 }]);
  });

  test('a four-piece line blocks the capture', () => {
    const board = [
      [null, 0, null, null],
      [0, null, 1, 1],
      [null, null, 0, 1],
      [1, 1, 0, 0],
    ];
    expect(collectCaptures([
      board[0],
      [0, 0, 1, 1],
      board[2],
      board[3],
    ], { row: 1, col: 1 }, 0)).toEqual([]);
    const next = applyMove({ ...createInitialGame(), board }, {
      from: { row: 0, col: 1 },
      to: { row: 1, col: 1 },
    });
    expect(next.board[1][2]).toBe(1);
    expect(next.board[1][3]).toBe(1);
  });

  test('the AI always returns a legal move', () => {
    const game = createInitialGame();
    const move = chooseAiMove(game, 0, 'smart');
    expect(validateMove(game, move, 0).valid).toBe(true);
  });
});
