import {SELECT, MOVE_TO} from './actionTypes.js';

export const select = (id) => ({
    type: SELECT,
    id: id
});

export const moveTo = (id) => ({
    type: MOVE_TO,
    id: id
});

