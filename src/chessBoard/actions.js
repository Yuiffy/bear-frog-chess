import { SELECT, MOVE_TO, SET_BOARD } from './actionTypes.js';

export const select = id => ({
  type: SELECT,
  id,
});

export const moveTo = id => ({
  type: MOVE_TO,
  id,
});

export const setBoard = board => ({
  type: SET_BOARD,
  board,
});
