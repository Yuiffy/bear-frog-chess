import {PLAY_CARD, SHOW_HAND, ROUND_END}from './actionTypes.js';

const initValues = {
    players: {
        player1: {
            life: 3,
            cards: [{id: 1}]
        },
        player2: {
            life: 1,
            cards: []
        }
    },
    nowPlayer: 'player1'
};
function cardWin(card, card2) {
    const t1 = card.type;
    const t2 = card2.type;
    let score = 0;
    const dis = (t2 + 3 - t1) % 3;
    if (dis === 1) {
        score = 1;
    } else if (dis === 2) {
        score = -1;
    }
    console.log(card, card2, t1, t2, dis, score);
    return score;
}
function cardsWin(cards1, cards2) {
    let score = 0;
    for (let i in cards1) {
        for (let j in cards2) {
            score += cardWin(cards1[i], cards2[j]);
        }
    }
    return score;
}
const getRoundEndLifes = (players) => {
    let lifes = {};
    const names = Object.keys(players);
    names.forEach((key) => {
        lifes[key] = players[key].life;
    });
    for (let i = 0; i < names.length - 1; i++) {
        for (let j = i + 1; j < names.length; j++) {
            const x = names[i];
            const y = names[j];
            const score = cardsWin(players[x].cardPlayed, players[y].cardPlayed);
            lifes[x] += score;
            lifes[y] -= score;
        }
    }
    console.log(lifes);
    return lifes;
};
export default (state = initValues, action) => {
    // console.log(state.order.indexOf(state.nowPlayer));
    switch (action.type) {
        case PLAY_CARD: {
            const {player} = action;
            let newCardPlayed = [...state.players[player]['cardPlayed']];
            const newState = {
                ...state, ['players']: {
                    ...state.players, [player]: {
                        ...state.players[player],
                        ['cards']: state.players[player]['cards'].filter((card) => {
                            if (card.id == action.id) newCardPlayed.push(card);
                            return card.id !== action.id;
                        }),
                        ['cardPlayed']: newCardPlayed
                    }
                },
                ['nowPlayer']: state.order[(state.order.indexOf(state.nowPlayer) + 1) % state.order.length]
            };
            console.log(player, state, newState);
            return newState
        }
        case SHOW_HAND: {
            return {
                ...state, ['isShow']: true
            };
        }
        case ROUND_END: {
            const newState = {
                ...state,
                ['nowPlayer']: state.order[(state.order.indexOf(state.nowPlayer) + 1) % state.order.length]
            };
            return newState;
        }
        default: {
            return state;
        }
    }
}
