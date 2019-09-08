/**
 * Created by yuiff on 2018/4/1.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import './style.css';
import { Link, Switch, Route } from 'react-router-dom';
import PlayControl from './gamePlaying.js';
import menuPage from "../../menu/menuPage";

class RouteControl extends Component {
  render() {
    const { chessBoard, player, gameOver } = this.props;
    const playControl = ({ match }) => <PlayControl {...this.props} roomId={match.params.roomId} player={match.params.playerId} />;
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
