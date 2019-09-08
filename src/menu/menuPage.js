import React, {Component} from 'react';
import {Link, Switch, Route} from 'react-router-dom';

import "./menuPage.scss";
import Button from '@material-ui/core/Button';

const buttonList = [
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

const menuPage = (props) => (<div className="menu-page">
  <div className={"title-field"}>
    <div className="page-title">
      熊蛙棋
    </div>
  </div>
  <div className="right-field">
    <div className="page-select-list">
      {buttonList.map(buttonData => {
        const {title, url, urlFunc} = buttonData;
        return <div>
          <Button
            raised className="mdc-button my-button" onClick={() => {
            if (urlFunc) props.history.push(urlFunc());
            else props.history.push(url);
          }}>
            {title}
          </Button></div>
      })}
    </div>
  </div>
  {/* <div><Link to="/">主菜单</Link></div> */}
</div>);

export default menuPage;
