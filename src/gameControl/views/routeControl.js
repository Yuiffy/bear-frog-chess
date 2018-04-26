/**
 * Created by yuiff on 2018/4/1.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import './style.css';
import { Link, Switch, Route } from 'react-router-dom';
import PlayControl from './gamePlaying.js';

class RouteControl extends Component {
  render() {
    const { chessBoard, player, gameOver } = this.props;
    const playControl = ({ match }) => <PlayControl {...this.props} roomId={match.params.roomId} player={match.params.playerId} />;
    const menuPage = () => (<div className="menuPage">
      <div><Link to="/local">本地双人</Link></div>
      <div><Link to="/online/123/0">在线双人-南位</Link></div>
      <div><Link to="/online/123/1">在线双人-北位</Link></div>
      {/* <div><Link to="/">主菜单</Link></div> */}
                            </div>);
    return (
      <div className="full-window">
        <div className="inner-window">
          <Switch>
            <Route path="/local" component={playControl} />
            <Route path="/online/:roomId/:playerId" component={playControl} />
            <Route exact path="/" component={menuPage} />
          </Switch>
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => ({});


export default connect(mapStateToProps)(RouteControl);
