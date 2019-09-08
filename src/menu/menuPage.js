import React, {Component} from 'react';
import {Link, Switch, Route} from 'react-router-dom';

import "./menuPage.scss";
import Button from '@material-ui/core/Button';

const buttonList = [
  {title: '本地双人', url: '/local'},
  {title: '在线双人-南位', url: '/online/123/0'},
  {title: '在线双人-北位', url: '/online/123/1'},
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
        const {title, url} = buttonData;
        return <div>
          <Button
            raised className="mdc-button my-button" onClick={() => {
            props.history.push(url);
          }}>
            {title}
          </Button></div>
      })}
    </div>
  </div>
  {/* <div><Link to="/">主菜单</Link></div> */}
</div>);

export default menuPage;
