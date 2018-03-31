import React from 'react';
import {connect} from 'react-redux';
import {select, moveTo} from '../actions.js';
import {roundEnd} from '../../player/actions';
import ChessItem from './chessItem.js';

import './style.css';

const ChessBoard = ({board, onSelect, onMoveTo}) => {
    let rowKey = 0;
    return (
        <div className="chess-board">
            {
                board.map((row) => (
                    <div className='row' key={rowKey++}>
                        {row.map((item) => (
                            <ChessItem
                                key={item.id}
                                chessId={item.id}
                                player={item.player}
                                type={item.type}
                                onSelect={()=>onSelect(item.id)}
                                onMoveTo={()=>onMoveTo(item.id)}
                            />
                        ))}
                    </div>
                ))
            }
        </div>
    );
};


const mapStateToProps = (state) => {
    return {
        board: state.chessBoard.board
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSelect: (id) => {
            dispatch(select(id));
        },
        onMoveTo: (id) => {
            dispatch(moveTo(id));
            dispatch(roundEnd());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChessBoard);

