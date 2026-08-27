import { useCallback, useEffect, useMemo, useState } from 'react';

const aiModule = require('./ai');
const rulesModule = require('./rules');

const { chooseAiMove } = aiModule;
const { applyMove, createInitialGame, positionToLabel } = rulesModule;

function entryFromGame(game) {
  if (!game.lastMove) return null;
  return {
    number: game.moveNumber,
    player: game.lastMove.player,
    from: game.lastMove.from,
    to: game.lastMove.to,
    notation: `${positionToLabel(game.lastMove.from)}–${positionToLabel(game.lastMove.to)}`,
    captured: game.lastMove.captured.length,
  };
}

export default function useLocalGame(mode, settings) {
  const [timeline, setTimeline] = useState(() => [createInitialGame()]);
  const [thinking, setThinking] = useState(false);
  const game = timeline[timeline.length - 1];
  const aiPlayer = 1 - settings.humanSide;

  const move = useCallback((from, to) => {
    setTimeline((current) => {
      const latest = current[current.length - 1];
      try {
        return current.concat(applyMove(latest, { from, to }));
      } catch (error) {
        return current;
      }
    });
  }, []);

  useEffect(() => {
    if (mode !== 'ai' || game.status !== 'playing' || game.turn !== aiPlayer) return undefined;
    setThinking(true);
    const expectedMoveNumber = game.moveNumber;
    const timer = setTimeout(() => {
      const aiMove = chooseAiMove(game, aiPlayer, settings.aiDifficulty);
      setTimeline((current) => {
        const latest = current[current.length - 1];
        if (!aiMove || latest.moveNumber !== expectedMoveNumber || latest.turn !== aiPlayer) return current;
        return current.concat(applyMove(latest, aiMove, aiPlayer));
      });
      setThinking(false);
    }, 520);
    return () => {
      clearTimeout(timer);
      setThinking(false);
    };
  }, [aiPlayer, game, mode, settings.aiDifficulty]);

  const restart = useCallback(() => {
    setThinking(false);
    setTimeline([createInitialGame()]);
  }, []);

  const undo = useCallback(() => {
    if (thinking) return;
    setTimeline((current) => {
      if (current.length <= 1) return current;
      if (mode === 'local') return current.slice(0, -1);

      let target = current.length - 2;
      while (target > 0 && current[target].turn !== settings.humanSide) target -= 1;
      return current.slice(0, target + 1);
    });
  }, [mode, settings.humanSide, thinking]);

  const history = useMemo(() => timeline.slice(1).map(entryFromGame), [timeline]);
  const localPlayers = mode === 'local' ? [0, 1] : [settings.humanSide];

  return {
    game,
    history,
    localPlayers,
    move,
    restart,
    thinking,
    undo,
    canUndo: timeline.length > 1 && !thinking,
  };
}
