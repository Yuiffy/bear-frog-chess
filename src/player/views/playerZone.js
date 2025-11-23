import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setLocalPlayer } from '../actions.js';
import CardItem from './cardItem.js';

class PlayerZone extends Component {
  constructor(props, context) {
    super(props, context);
    this.render = this.render.bind(this);
    this.state = {};
  }

  componentDidUpdate(preProps) {
    const { isNowPlayer } = this.props;
    const { onRemoveCard } = this.props;
    const { isComputer } = this.props;
    const { player } = this.props;
    const { cards } = this.props;
    const { nowPlayer } = this.props;
    const { life } = this.props;
    console.log('AI', isNowPlayer, isComputer, player, nowPlayer);
    if (isNowPlayer && isComputer && life > 0) {
      const { length } = cards;
      const selectCardIndex = Math.floor(Math.random() * length);
      const selectCardId = cards[selectCardIndex].id;
      onRemoveCard(selectCardId, player);
    }
  }

  render() {
    // const cards = this.props.cards;
    const { player } = this.props;
    const { life } = this.props;
    const { onRemoveCard } = this.props;
    const { noCard } = this.props;
    const { isComputer } = this.props;
    if (noCard && !isComputer) {
      let str = `出完了！你还剩${life}星星，`;
      if (life === 3) str += '能够全身而退，无敌。';
      else if (life < 3) str += '不足3颗，完蛋了。';
      else str += '赚到。';
      alert(str);
      if (life >= 3) window.location.href = 'http://www.daifish.top/hebi.html';
      else window.location.href = 'http://www.daifish.top/mario.html';
    }
    return (
      <div className="playerZone">
        {
                    life <= 0
                      ? (
                        <div className="dead">
                          死了。
                        </div>
                      )
                      : life !== 0(
                        <div>
                          {player}
                          {/* <div className="cardZone"> */}
                          {/* { */}
                          {/* cards.map((item) => ( */}
                          {/* <CardItem */}
                          {/* key={item.id} */}
                          {/* type={item.type} */}
                          {/* player={player} */}
                          {/* onRemove={() => onRemoveCard(item.id, player)} */}
                          {/* /> */}
                          {/* )) */}
                          {/* } */}
                          {/* </div> */}
                          <div className="lifeZone">
                            {
                                    Array.from(Array(life), () => '★').map((item) => (
                                      <span>{item}</span>
                                    ))
                                }
                          </div>
                        </div>,
                      )
}

      </div>
    );
  }
}

PlayerZone.propTypes = {
  cards: PropTypes.array.isRequired,
  life: PropTypes.number.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  cards: state.player.players[ownProps.player].cards,
  life: state.player.players[ownProps.player].life,
  noCard: false,
  isComputer: state.player.players[ownProps.player].isComputer,
  isNowPlayer: state.player.nowPlayer === ownProps.player,
  nowPlayer: state.player.nowPlayer,
});

const mapDispatchToProps = (dispatch) => ({
  onRemoveCard: (id, player) => {
    dispatch(setLocalPlayer(id, player));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayerZone);
