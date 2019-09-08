/**
 * Created by yuiff on 2018/4/1.
 */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import './style.css';
import {Link, Switch, Route} from 'react-router-dom';
import PlayControl from './gamePlaying.js';
import menuPage from "../../menu/menuPage";
import RoomMenu from "../../menu/RoomMenu";

class RouteControl extends Component {
  render() {
    const {chessBoard, player, gameOver} = this.props;
    const playControl = ({match}) => <PlayControl {...this.props} roomId={match.params.roomId}
                                                  player={match.params.playerId}/>;
    const roomControl = (props) => {
      const {match} = props;
      return <RoomMenu {...props} roomId={match.params.roomId}/>
    };
    return (
      <div className="full-window">
        <div className="inner-window">
          <Switch>
            <Route path="/local" component={playControl}/>
            <Route path="/online/:roomId/:playerId" component={playControl}/>
            <Route exact path="/" component={menuPage}/>
            <Route path="/room/:roomId" component={roomControl}/>
          </Switch>
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => ({});


export default connect(mapStateToProps)(RouteControl);
