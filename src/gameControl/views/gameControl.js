import React, {Component} from 'react';
import {connect} from 'react-redux';
import './style.css';

class PlayControl extends Component {

    componentDidUpdate(preProps) {
        const {gameOver, winners} = this.props;
        if (gameOver) {
            alert('游戏结束！胜者是' + winners);
            window.location.reload();
        }
    }

    render() {
        const {chessBoard, player, gameOver} = this.props;
        return (
            <div className="full-window">
                <div className="inner-window">
                    <div>{chessBoard}</div>
                    <div>{player}</div>
                </div>
            </div>
        );
    };
}


const mapStateToProps = (state) => {
    const board = state.chessBoard.board;
    const flatten = arr => arr.reduce((pre, val) => pre.concat(Array.isArray(val) ? flatten(val) : val), []);
    const flatBoard = flatten(board);

    const playerChessCount = {...state.player.order};
    for (let key in playerChessCount) playerChessCount[key] = 0;
    for (let i in flatBoard) {
        playerChessCount[flatBoard[i].player]++;
    }
    let gameOver = false;
    let winners = [];
    for (let key in playerChessCount) {
        if (playerChessCount[key] <= 1)
            gameOver = true;
        else if (state.player.players[parseInt(key)]) winners.push(state.player.players[parseInt(key)].name);
    }
    console.log(flatBoard, gameOver);
    return {
        gameOver: gameOver,
        winners: gameOver ? winners : []
    };
};

// const mapDispatchToProps = (dispatch) => {
//     return {
//         onSelect: (id) => {
//             dispatch(select(id));
//         },
//         moveTo: (x, y) => {
//             dispatch(moveTo(x, y));
//         }
//     };
// };

export default connect(mapStateToProps)(PlayControl);
