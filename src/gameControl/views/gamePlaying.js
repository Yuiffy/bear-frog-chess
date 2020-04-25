import React, {Component} from 'react';
import {connect} from 'react-redux';
import './style.css';
import {Link, Switch, Route} from 'react-router-dom';
import {setBoard} from '../../chessBoard/actions.js';
import {reset, updateSocket} from '../actions.js';
import SocketClient, {gameMessage} from '../../utils/controlClients/SocketClient';
import {roundEnd, setLocalPlayer} from '../../player/actions';
import {moveTo} from '../../chessBoard/actions';
import {socketContainer} from '../../utils';
import {getNextPosList} from '../../chessBoard/views/chessItem';
import {ChessTypes} from '../../constants';
import AIClient from "../../utils/controlClients/AIClient";

class PlayControl extends Component {
  constructor(props) {
    super(props);
    console.log('PlayControl　constructor', props);
    const {roomId, vsAI, player} = props;
    this.props.setBoard();
    if (props.roomId || vsAI) {
      this.props.setLocalPlayer([parseInt(props.player)]);

      const host = process.env.REACT_APP_WS_HOST + props.roomId;
      const GameClient = vsAI ? AIClient : SocketClient;
      const socketClient = new GameClient();
      socketClient.connect(host);
      socketClient.setOnOpen(() => {
        socketClient.send(gameMessage(null, null, null, true));
      });
      socketClient.setOnMessage((event) => {
        console.log(event, event.data, JSON.parse(event.data));
        // alert(event.data);
        const data = JSON.parse(event.data);
        if (data.needMessage) {
          const {board, nowPlayer, gameOver} = this.props;
          if (!gameOver) socketClient.send(gameMessage(board, nowPlayer, false));
        } else {
          props.onReceiveBoard(data);
        }
      });
      socketContainer.setSocketClient(socketClient);
    } else {
      this.props.setLocalPlayer([0, 1]);
      socketContainer.setSocketClient(null);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {gameOver: preGameOver} = this.props;
    const {gameOver, winners} = nextProps;
    console.log('judge gameOver! ', this.props, gameOver, preGameOver);
    if (gameOver && !preGameOver) {
      alert(`游戏结束！胜者是${winners}`);
      // window.location.reload();
      nextProps.resetAll();
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
          <div>规则：本回合移动的己方棋子和其移动后相邻的棋子，两个棋子组成炮台，杀死处在该炮台连线上相邻的敌方棋子。如果这条直线上有4个棋子则杀不掉。当有玩家只剩1颗棋子或者无法行动时输掉。</div>
        </div>
      </div>
    );
  }
}

const flatten = arr => arr.reduce((pre, val) => pre.concat(Array.isArray(val) ? flatten(val) : val), []);

function judgeGameOver(playerChessCount, player, board) {
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

const mapStateToProps = (state) => {
  const board = state.chessBoard.board;
  const flatBoard = flatten(board);

  const playerChessCount = {...state.player.order};
  for (const key in playerChessCount) playerChessCount[key] = 0;
  for (const i in flatBoard) {
    playerChessCount[flatBoard[i].player]++;
  }
  const {gameOver, winners} = judgeGameOver(playerChessCount, state.player, board);
  console.log(flatBoard, gameOver);
  return {
    gameOver,
    winners: gameOver ? winners : [],
    board,
    nowPlayer: state.player.nowPlayer,
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
  resetAll: () => {
    dispatch(setBoard());
  },
  onReceiveBoard: (data) => {
    const {board, nowPlayer, isRoundEnd} = data;
    console.log('will dispatch, board=', board, nowPlayer, isRoundEnd);
    dispatch(setBoard(board));
    if (nowPlayer || nowPlayer === 0) dispatch(setLocalPlayer(null, nowPlayer));
    if (isRoundEnd) dispatch(roundEnd());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayControl);
