import {SET_LOCAL_PLAYER, ROUND_END} from './actionTypes.js';

export const setLocalPlayer = (local, nowPlayer) => ({
    type: SET_LOCAL_PLAYER,
    local: local,
    nowPlayer: nowPlayer
});

export const roundEnd = () => ({
    type: ROUND_END
});