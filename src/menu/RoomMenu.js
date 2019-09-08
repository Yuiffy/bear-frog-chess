import React, {Component} from 'react';
import {Link, Switch, Route} from 'react-router-dom';

import "./RoomMenu.scss";
import Button from '@material-ui/core/Button';
import {CopyToClipboard} from "react-copy-to-clipboard";

const buttonList = [
  {title: '玩家1进入', urlFunc: (roomId, playerId) => `/online/${roomId}/${playerId}`},
  {title: '玩家2进入', urlFunc: (roomId, playerId) => `/online/${roomId}/${playerId}`},
];

const OnePlayerPanel = (props) => {
  const {playerName, url} = props;
  return <div className='one-player-panel'>
    <div>{playerName}</div>
    <div>
      <input className='my-input' value={url} readOnly={true}/>
      <CopyToClipboard text={url}
                       onCopy={() => {
                       }}>
        <button className='copy-button' onClick={() => {
        }}>复制网址
        </button>
      </CopyToClipboard>
    </div>
    <Button
      raised className="enter-button" onClick={() => {
      props.onJump && props.onJump();
    }}>{`进入${playerName}座位`}</Button>
  </div>
};

const RoomMenu = (props) => {
  const {history, roomId} = props;
  console.log("location!", props.location, window.location);
  const host = window.location.host;
  return (<div className="menu-page">
    <div className={"title-field"}>
      <div className="page-info">
        网络1V1对战：把一个座位的网址发给朋友，自己进入另一个座位网址。
      </div>
      <div><Button outlined className="back-button" onClick={() => {
        props.history.push(`/`);
      }}>返回主菜单</Button></div>
    </div>
    <div className="right-field">
      <div className="player-copy-field">
        <OnePlayerPanel playerName={"玩家1"} url={`${host}#/online/${roomId}/${0}`} onJump={() => {
          props.history.push(`/online/${roomId}/${0}`);
        }}/>
        <OnePlayerPanel playerName={"玩家2"} url={`${host}#/online/${roomId}/${1}`} onJump={() => {
          props.history.push(`/online/${roomId}/${1}`);
        }}/>
      </div>
    </div>
  </div>);
}

export default RoomMenu;
