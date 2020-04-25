import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import MdAccessibility from 'react-icons/lib/md/accessibility';
import MdAccessible from 'react-icons/lib/md/accessible';
import MdPets from 'react-icons/lib/md/pets';
import * as FontAwesome from 'react-icons/lib/fa'
import {ChessTypes} from '../../constants.js';
import {findChessPos} from '../../utils';
import {judgeCanBeMoveTo, getNextPosList} from "../../utils/boardUtils";

class ChessItem extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {}
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    const {player, type, beSelected, canBeMoveTo, onSelect, onMoveTo, canBeSelect, typeChangeInfo} = this.props;
    const onClick = () => {
      if (canBeMoveTo) {
        onMoveTo();
      } else if (type != ChessTypes.NONE && canBeSelect) {
        onSelect();
      }
    };
    let iconClassName = `chess-item ${player == 1 ? 'enemy' : ''} `;
    if (type === ChessTypes.NONE) {
      if (typeChangeInfo === "LEAVE")
        iconClassName += 'leave ';
      else if (typeChangeInfo === "DIE") {
        iconClassName += 'die ';
      } else {
        iconClassName += 'normal-none  ';
      }
    } else {
      if (typeChangeInfo === "ARRIVE") {
        iconClassName += 'arrive ';
      } else {
        iconClassName += 'normal-display ';
      }
    }

    let icon = null;
    if (player == 0)
      icon = <MdAccessibility className={iconClassName}/>
    else
      icon = <MdAccessibility className={iconClassName}/>;
    return (
      <div
        className={`chess-block ${beSelected ? 'selected' : ''} ${canBeMoveTo ? 'can-be-move-to' : ''} ${canBeSelect && !beSelected ? 'can-be-select' : ''} `}
        onClick={onClick}>
        {icon}
      </div>
    );
  }
}

// TodoItem.propTypes = {
//   onToggle: PropTypes.func.isRequired,
//   onRemove: PropTypes.func.isRequired,
//   completed: PropTypes.bool.isRequired,
//   text: PropTypes.string.isRequired
// }


const mapStateToProps = (state, {chessId, player}) => ({
  beSelected: state.chessBoard.selected && state.chessBoard.selectId == chessId,
  canBeMoveTo: judgeCanBeMoveTo(state.chessBoard, chessId),
  canBeSelect: state.player.nowPlayer === player && state.player.local.indexOf(player) != -1,
});

export default connect(mapStateToProps)(ChessItem);
export { getNextPosList };
