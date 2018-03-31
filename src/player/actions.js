import {PLAY_CARD, SHOW_HAND, ROUND_END} from './actionTypes.js';

export const playCard = (id, player) => ({
    type: PLAY_CARD,
    id: id,
    player: player
});

export const showHand = () => ({
    type: SHOW_HAND
});

export const roundEnd = () => ({
    type: ROUND_END
});