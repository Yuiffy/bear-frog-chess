import React from 'react';
import { view as GameControl } from './gameControl';
import { view as ChessBoard } from './chessBoard';
import { view as Player } from './player';

function App() {
  const chessBoard = ChessBoard;
  const player = <Player />;
  return (
    <GameControl ChessBoard={chessBoard} player={player} />
  );
}

export default App;
