import React from 'react';
import PlayerZone from './playerZone.js';
import PublicZone from './publicZone.js';

import './style.css';

export default () => {
    return (
        <div className="gameBoard">
            <div className="tips">你在一场赌局之中。你有3颗星星，12张牌。过程中如果失去所有星星，或者剩下牌没出完，或者最后少于三颗星星，就会被抓去地底当矿工还债。现在全场只剩下一个人来和你赌了。</div>
            <PlayerZone player="对手"/>
            <PublicZone />
            <PlayerZone player="你"/>
        </div>
    );
}

