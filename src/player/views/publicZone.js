import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import {bindActionCreators} from 'redux';
import CardItem from './cardItem.js';
import { playCard, showHand, roundEnd } from '../actions.js';
// import {FilterTypes} from '../../constants.js';

const PublicZone = ({ nowPlayerName, roundEnd }) => (
  <div className="" onClick={roundEnd}>
            现在轮到{nowPlayerName}行动
  </div>
);

const mapStateToProps = state => ({
  nowPlayerName: state.player.players[state.player.nowPlayer].name,
});

const mapDispatchToProps = dispatch => ({
  roundEnd: () => {
    dispatch(roundEnd());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PublicZone);

