import React from 'react';
import PropTypes from 'prop-types'
import {connect} from 'react-redux';
import MdAccessibility from 'react-icons/lib/md/accessibility';
import MdPets from 'react-icons/lib/md/pets';
import {ChessTypes} from '../../constants.js';
import {findChessPos} from '../../utils';

const ChessItem = ({player, type, beSelected, canBeMoveTo, onSelect, onMoveTo, canBeSelect}) => {
    const onClick = () => {
        if (canBeMoveTo)
            onMoveTo();
        else if (type != ChessTypes.NONE && canBeSelect)
            onSelect();
    };
    const icon = (player == 0) ?
        <MdPets className={`chess-item ${player == 1 ? 'enemy' : ''}`}/> :
        <MdAccessibility className={`chess-item ${player == 1 ? 'enemy' : ''}`}/>;
    return (
        <div
            className={`chess-block ${beSelected ? 'selected' : ''} ${canBeMoveTo ? 'can-be-move-to' : ''} ${canBeSelect && !beSelected ? 'can-be-select' : ''}`}
            onClick={onClick}>
            {
                type == ChessTypes.NORMAL ?
                    icon
                    : ''
            }
        </div>
    );
}


// TodoItem.propTypes = {
//   onToggle: PropTypes.func.isRequired,
//   onRemove: PropTypes.func.isRequired,
//   completed: PropTypes.bool.isRequired,
//   text: PropTypes.string.isRequired
// }

function getNextPosList(board, x, y) {
    let maxX = board.length;
    let maxY = board[0].length;
    let gx = [0, 0, -1, 1];
    let gy = [1, -1, 0, 0];
    let moveList = [];
    for (let i in gx) {
        const x2 = x + gx[i];
        const y2 = y + gy[i];
        // console.log(x, y, gx[i], gy[i], x2, y2, maxX, maxY, typeof(x), typeof(gx[i]));
        if (x2 >= 0 && x2 < maxX && y2 >= 0 && y2 < maxY && board[x2][y2].type === ChessTypes.NONE) {
            moveList.push(board[x2][y2].id);
        }
    }
    return moveList;
}
const judgeCanBeMoveTo = ({board, selectId, selected}, chessId) => {
    if (!selected)return false;
    let {x, y} = findChessPos(board, selectId);
    let moveList = getNextPosList(board, x, y);
    // console.log(moveList.indexOf(chessId) !== -1);
    return moveList.indexOf(chessId) !== -1;
};
const mapStateToProps = (state, {chessId, player}) => {
    return {
        beSelected: state.chessBoard.selected && state.chessBoard.selectId == chessId,
        canBeMoveTo: judgeCanBeMoveTo(state.chessBoard, chessId),
        canBeSelect: state.player.nowPlayer === player && state.player.local.indexOf(player) != -1
    };
};

export default connect(mapStateToProps)(ChessItem);

