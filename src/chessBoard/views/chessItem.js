import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
// import MdAccessibility from 'react-icons/lib/md/accessibility';
import {GiBearFace, GiFrogPrince} from 'react-icons/gi'
// import MdAccessible from 'react-icons/lib/md/accessible';
// import MdPets from 'react-icons/lib/md/pets';
// import * as FontAwesome from 'react-icons/lib/fa'
import {ChessTypes} from '../../constants.js';
import {findChessPos} from '../../utils';
import {judgeCanBeMoveTo, getNextPosList} from "../../utils/boardUtils";

const ChessComponent = (props)=>{
  const {iconClassName, children} = props;
  // return <div className={iconClassName} style={{background: 'red'}}><MdAccessibility className={iconClassName}/>🐻</div>
  return <div className={`${iconClassName}`}>
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox='0 0 512 512'>
        <text x='50%' y="50%" dominantBaseline="central" textAnchor="middle" style={{fontSize: "256px"}} >
          {children}
        </text>
    </svg>
    </div>
  ;
}

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
      icon = null;
    else
      icon = <GiBearFace className={iconClassName}/>;
    return (
      <div
        className={`chess-block ${beSelected ? 'selected' : ''} ${canBeMoveTo ? 'can-be-move-to' : ''} ${canBeSelect && !beSelected ? 'can-be-select' : ''} `}
        onClick={onClick}>
        <ChessComponent iconClassName={iconClassName}>{player===0?'🐻':'🐸'}</ChessComponent>
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
