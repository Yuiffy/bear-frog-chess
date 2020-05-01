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
import qs from "qs";

class RouteControl extends Component {
  render() {
    const {chessBoard, player, gameOver} = this.props;
    const playControl = ({match, location, ...others}) => {
      console.log("playControl", match, others, this.props);
      const params = qs.parse(location.search, { ignoreQueryPrefix: true });
      return <PlayControl {...this.props} roomId={match.params.roomId}
                   player={match.params.playerId} vsAI={match.params.hasAI} params={params}/>;
    }
    const roomControl = (props) => {
      const {match} = props;
      return <RoomMenu {...props} roomId={match.params.roomId}/>
    };
    return (
      <div className="full-window">
        <div className="inner-window">
          <Switch>
            <Route path="/local" component={playControl}/>
            <Route path="/local-ai/:hasAI/:playerId" component={playControl} />
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
