import React, { Component } from 'react';
import { connect } from 'react-redux';
import './style.css';
import { Link, Switch, Route } from 'react-router-dom';
import { setBoard } from '../../chessBoard/actions.js';
import { reset, updateSocket } from '../actions.js';
import SocketClient, { gameMessage } from '../../utils/SocketClient';
import { roundEnd, setLocalPlayer } from '../../player/actions';
import { moveTo } from '../../chessBoard/actions';
import { socketContainer } from '../../utils';

class PlayControl extends Component {
  constructor(props) {
    super(props);
    console.log('props.roomId', props.roomId);
    this.props.setBoard();
    if (props.roomId) {
      this.props.setLocalPlayer([parseInt(props.player)]);

      const host = process.env.REACT_APP_WS_HOST + props.roomId;
      const socketClient = new SocketClient();
      socketClient.connect(host);
      socketClient.setOnMessage((event) => {
        console.log(event, event.data, JSON.parse(event.data));
        // alert(event.data);
        const data = JSON.parse(event.data);
        props.onReceiveBoard(data);
      });
      socketClient.send(gameMessage(null, null, true));
      socketContainer.setSocketClient(socketClient);
    } else {
      this.props.setLocalPlayer([0, 1]);
    }
  }

  componentDidUpdate(preProps) {
    const { gameOver, winners } = this.props;
    console.log(this.props);
    if (gameOver) {
      alert(`游戏结束！胜者是${winners}`);
      window.location.reload();
    }
  }

  render() {
    const {
      chessBoard, player, gameOver, roomId,
    } = this.props;

    return (
      <div className="full-window">
        <div className="inner-window">
          {roomId ? <div>房间{roomId}</div> : ''}
          <div>{chessBoard}</div>
          <div>{player}</div>
        </div>
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  const board = state.chessBoard.board;
  const flatten = arr => arr.reduce((pre, val) => pre.concat(Array.isArray(val) ? flatten(val) : val), []);
  const flatBoard = flatten(board);

  const playerChessCount = { ...state.player.order };
  for (const key in playerChessCount) playerChessCount[key] = 0;
  for (const i in flatBoard) {
    playerChessCount[flatBoard[i].player]++;
  }
  let gameOver = false;
  const winners = [];
  for (const key in playerChessCount) {
    if (playerChessCount[key] <= 1) {
      gameOver = true;
    } else if (state.player.players[parseInt(key)]) winners.push(state.player.players[parseInt(key)].name);
  }
  console.log(flatBoard, gameOver);
  return {
    gameOver,
    winners: gameOver ? winners : [],
  };
};

const mapDispatchToProps = dispatch => ({
  setLocalPlayer: (local) => {
    dispatch(setLocalPlayer(local));
  },
  setNowPlayer: (nowPlayer) => {
    dispatch(setLocalPlayer(null, nowPlayer));
  },
  setBoard: (board) => {
    dispatch(setBoard(board));
  },
  reset: () => {
    dispatch(reset());
  },
  onReceiveBoard: (data) => {
    const { board, nowPlayer } = data;
    console.log('will dispatch, board=', board);
    dispatch(setBoard(board));
    dispatch(setLocalPlayer(null, nowPlayer));
    dispatch(roundEnd());
  },
  updateSocket: (socketClient) => {
    dispatch(updateSocket(socketClient));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayControl);
