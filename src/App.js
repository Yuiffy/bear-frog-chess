import React from 'react';
import {view as GameControl} from './gameControl/';
import {view as ChessBoard} from './chessBoard/';
import {view as Player} from './player/';
import {Link, Route, Switch} from 'react-router-dom'

function App() {
    const chessBoard = <ChessBoard/>;
    const player = <Player/>;
    return (
        <GameControl chessBoard={chessBoard} player={player}/>
    );
}

export default App;
