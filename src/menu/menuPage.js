import React, {Component} from 'react';
import {Link, Switch, Route} from 'react-router-dom';

import "./menuPage.scss";
import Button from '@material-ui/core/Button';
import qs from "qs";

const buttonList = [
  {title: '单挑AI', url: '/local-ai/1/0'},
  {title: '本地双人', url: '/local'},
  // {title: '在线双人-南位', url: '/online/123/0'},
  // {title: '在线双人-北位', url: '/online/123/1'},
  {
    title: '网络对战', urlFunc: () => {
      const randomNumber = Math.floor(Math.random() * 1000000 + 1);
      return `/room/${randomNumber}`
    }
  },
];

const menuPage = (props) => {
  const urlParams = props.location.search;
  const params = qs.parse(urlParams, {ignoreQueryPrefix: true});
  let gameNameDisplay = '熊蛙棋';
  if (params.playerNames) {
    gameNameDisplay = '';
    const names = JSON.parse(params.playerNames);
    console.log("names", names);
    names.forEach(one=>gameNameDisplay+=one);
    gameNameDisplay += '棋';
  }
  return (<div className="menu-page">
    <div className={"title-field"}>
      <div className="page-title">
        {gameNameDisplay}
      </div>
    </div>
    <div className="right-field">
      <div className="page-select-list">
        {buttonList.map(buttonData => {
          const {title, url, urlFunc} = buttonData;
          return <div>
            <Button
              raised className="mdc-button my-button" onClick={() => {
              if (urlFunc) props.history.push(`${urlFunc()}${urlParams}`);
              else props.history.push(`${url}${urlParams}`);
            }}>
              {title}
            </Button></div>
        })}
      </div>
    </div>
    {/* <div><Link to="/">主菜单</Link></div> */}
  </div>);
}

export default menuPage;
