import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { playCard } from '../actions.js';

function CardItem({
  type, active, isShow, onRemove,
}) {
  let typeShow = '';
  switch (type) {
    case 0:
      typeShow = '石头';
      break;
    case 1:
      typeShow = '剪刀';
      break;
    case 2:
      typeShow = '布';
      break;
  }
  return (
    <div
      className="card"
      onClick={active ? onRemove : null}
      style={{
        backgroundColor: active ? 'yellow' : 'white',
      }}
    >
      {active || isShow ? typeShow : ''}
    </div>
  );
}

CardItem.propTypes = {
  type: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  isShow: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  active: state.game.nowPlayer === ownProps.player && state.game.players[ownProps.player].cardPlayed.length === 0,
});

export default connect(mapStateToProps)(CardItem);
