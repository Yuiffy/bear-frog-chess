import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  FiArrowLeft,
  FiCheck,
  FiEye,
  FiHelpCircle,
  FiLink,
  FiMaximize,
  FiRefreshCw,
  FiRotateCcw,
  FiSettings,
  FiWifi,
  FiWifiOff,
} from 'react-icons/fi';

import BoardCanvas from '../game/BoardCanvas';
import { copyText, getInviteUrl, toggleFullscreen } from '../game/browser';
import useLocalGame from '../game/useLocalGame';
import useOnlineRoom from '../game/useOnlineRoom';
import {
  Modal, ResultDialog, RulesDialog, SettingsDialog,
} from '../components/GameDialogs';
import IconButton from '../components/IconButton';

const rulesModule = require('../game/rules');

const {
  countPieces, getLegalDestinations, samePosition,
} = rulesModule;

const CONNECTION_LABELS = {
  connecting: '连接中',
  online: '已连接',
  reconnecting: '重连中',
  offline: '已离线',
  replaced: '会话已转移',
};

function PlayerRow({ player, data, active, count, local }) {
  return (
    <div className={`player-row${active ? ' is-active' : ''}`}>
      <span className={`player-dot player-dot--${player}`} />
      <span className="player-row__piece">{data.piece}</span>
      <span className="player-row__identity">
        <strong>{data.name}</strong>
        <small>{data.connected === false ? '暂时离线' : local ? '本机' : `棋手 ${player + 1}`}</small>
      </span>
      <span className="player-row__count">{count}</span>
    </div>
  );
}

function HistoryList({ history, pieces }) {
  if (!history.length) return <p className="empty-history">尚未落子</p>;
  return (
    <ol className="history-list">
      {history.slice().reverse().map((entry) => (
        <li key={`${entry.number}-${entry.notation}`}>
          <span className={`history-index history-index--${entry.player}`}>{entry.number}</span>
          <span className="history-piece">{pieces[entry.player]}</span>
          <span>{entry.notation}</span>
          {entry.captured > 0 ? <strong>×{entry.captured}</strong> : null}
        </li>
      ))}
    </ol>
  );
}

function GameWorkspace({
  mode,
  roomId,
  game,
  history,
  playerData,
  localPlayers,
  onMove,
  onUndo,
  canUndo,
  onRestart,
  thinking,
  connection,
  seat,
  rematchVotes = [],
  onRematch,
  error,
  onDismissError,
  settings,
  onUpdateSettings,
  historyNavigation,
}) {
  const [selected, setSelected] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const counts = useMemo(() => countPieces(game.board), [game.board]);
  const pieces = playerData.map((player, index) => player.piece || settings.pieces[index]);
  const roomReady = mode !== 'online' || playerData.every((player) => player.present && player.connected);
  const canAct = game.status === 'playing'
    && localPlayers.includes(game.turn)
    && !thinking
    && roomReady
    && (mode !== 'online' || connection === 'online');
  const legalDestinations = useMemo(() => (
    selected ? getLegalDestinations(game.board, selected) : []
  ), [game.board, selected]);

  useEffect(() => {
    setSelected(null);
  }, [game.moveNumber, game.turn]);

  useEffect(() => {
    setResultOpen(game.status === 'finished');
  }, [game.status]);

  const handleCell = useCallback((position) => {
    if (!canAct) {
      setSelected(null);
      return;
    }
    if (selected && legalDestinations.some((item) => samePosition(item, position))) {
      onMove(selected, position);
      setSelected(null);
      return;
    }
    if (game.board[position.row][position.col] === game.turn) setSelected(position);
    else setSelected(null);
  }, [canAct, game.board, game.turn, legalDestinations, onMove, selected]);

  let statusTitle = `${playerData[game.turn].name}回合`;
  let statusDetail = localPlayers.includes(game.turn) ? '你的回合' : '等待对手';
  if (thinking) statusDetail = 'AI 思考中';
  if (mode === 'online' && !roomReady) statusDetail = seat === null ? '旁观席' : '等待棋手加入';
  if (mode === 'online' && connection !== 'online') statusDetail = CONNECTION_LABELS[connection] || '连接中';
  if (game.status === 'finished') {
    statusTitle = `${playerData[game.winner].name}获胜`;
    statusDetail = game.endReason === 'blocked' ? '对手无路可走' : '对手仅剩一子';
  }

  const resultWinner = game.status === 'finished' ? playerData[game.winner] : null;
  const localWinner = game.status === 'finished' && localPlayers.includes(game.winner);
  const resultTone = mode === 'local' ? 'neutral' : localWinner ? 'win' : 'lose';
  const resultTitle = mode === 'local' && resultWinner
    ? `${resultWinner.name}获胜`
    : localWinner ? '胜利！' : '失败';
  const resultReason = game.endReason === 'blocked' ? '对手已无合法移动' : '对手仅剩一枚棋子';
  const isOnlinePlayer = mode === 'online' && (seat === 0 || seat === 1);
  const resultActionLabel = mode === 'online'
    ? (rematchVotes.includes(seat) ? '等待对手' : '再来一局')
    : '重新开局';

  useEffect(() => {
    window.render_game_to_text = () => JSON.stringify({
      screen: 'game',
      mode,
      roomId: roomId || null,
      coordinateSystem: 'origin top-left; rows increase downward; columns increase rightward',
      status: game.status,
      turn: game.turn,
      winner: game.winner,
      moveNumber: game.moveNumber,
      board: game.board,
      players: playerData,
      localPlayers,
      selected,
      legalDestinations,
      lastMove: game.lastMove,
      connection: connection || null,
      seat: seat === undefined ? null : seat,
    });
    window.__bearFrogGame = {
      cell: handleCell,
      state: game,
    };
    return () => {
      delete window.render_game_to_text;
      delete window.__bearFrogGame;
    };
  }, [connection, game, handleCell, legalDestinations, localPlayers, mode, playerData, roomId, seat, selected]);

  const shareRoom = async () => {
    const inviteUrl = getInviteUrl(roomId);
    try {
      if (navigator.share) await navigator.share({ title: '熊蛙棋', text: `加入房间 ${roomId}`, url: inviteUrl });
      else await copyText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (shareError) {
      if (shareError.name !== 'AbortError') {
        await copyText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    }
  };

  return (
    <div className="app-shell game-screen">
      <div
        className="background-wash"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/forest-table.png)` }}
      />
      <header className="topbar game-topbar">
        <IconButton label="返回主菜单" onClick={() => historyNavigation.push('/')}><FiArrowLeft /></IconButton>
        <div className="match-title">
          <strong>{mode === 'online' ? `房间 ${roomId}` : mode === 'ai' ? '挑战 AI' : '本地双人'}</strong>
          {mode === 'online' ? (
            <span className={`connection-state connection-state--${connection}`}>
              {connection === 'online' ? <FiWifi /> : <FiWifiOff />}
              {CONNECTION_LABELS[connection] || '连接中'}
            </span>
          ) : null}
        </div>
        <div className="topbar__actions">
          {mode === 'online' ? (
            <button type="button" className="button button--compact" onClick={shareRoom}>
              {copied ? <FiCheck /> : <FiLink />}
              {copied ? '已复制' : '邀请'}
            </button>
          ) : null}
          <IconButton className="game-help-button" label="规则" onClick={() => setRulesOpen(true)}><FiHelpCircle /></IconButton>
          <IconButton className="game-settings-button" label="棋局设置" onClick={() => setSettingsOpen(true)}><FiSettings /></IconButton>
          <IconButton className="game-fullscreen-button" label="全屏" onClick={toggleFullscreen}><FiMaximize /></IconButton>
        </div>
      </header>

      <main className="game-layout">
        <aside className="match-panel" aria-label="棋手状态">
          <p className="panel-label">棋手</p>
          {[1, 0].map((player) => (
            <PlayerRow
              key={player}
              player={player}
              data={playerData[player]}
              active={game.status === 'playing' && game.turn === player}
              count={counts[player]}
              local={localPlayers.includes(player)}
            />
          ))}
          {mode === 'online' && seat === null ? (
            <div className="spectator-label"><FiEye />旁观中</div>
          ) : null}
          <div className="turn-counter">
            <span>回合</span>
            <strong>{game.moveNumber + (game.status === 'playing' ? 1 : 0)}</strong>
          </div>
        </aside>

        <section className="board-workspace" aria-label="棋局">
          <div className="turn-heading" aria-live="polite">
            <span className={`player-dot player-dot--${game.winner === null ? game.turn : game.winner}`} />
            <div>
              <h1>{statusTitle}</h1>
              <p>{statusDetail}</p>
            </div>
          </div>
          <div className="board-frame">
            <BoardCanvas
              game={game}
              pieces={pieces}
              selected={selected}
              legalDestinations={legalDestinations}
              orientation={mode === 'online' && seat === 1 ? 1 : 0}
              disabled={!canAct && game.status === 'playing'}
              onCell={handleCell}
              onCancel={() => setSelected(null)}
            />
          </div>

          <div className="game-actions">
            {mode !== 'online' ? (
              <button type="button" className="button button--ghost" disabled={!canUndo} onClick={onUndo}>
                <FiRotateCcw />
                悔棋
              </button>
            ) : null}
            {mode !== 'online' ? (
              <button type="button" className="button button--ghost" onClick={() => setRestartOpen(true)}>
                <FiRefreshCw />
                重开
              </button>
            ) : null}
            {mode === 'online' && game.status === 'finished' ? (
              <button type="button" className="button button--primary" onClick={onRematch}>
                <FiRefreshCw />
                {rematchVotes.includes(seat) ? '等待对手' : '再来一局'}
              </button>
            ) : null}
          </div>

          <details className="mobile-history">
            <summary>棋谱 · {history.length}</summary>
            <HistoryList history={history} pieces={pieces} />
          </details>
        </section>

        <aside className="history-panel" aria-label="棋谱">
          <div className="history-panel__title">
            <p className="panel-label">棋谱</p>
            <span>{history.length}</span>
          </div>
          <HistoryList history={history} pieces={pieces} />
        </aside>
      </main>

      {error ? (
        <div className="toast" role="alert">
          <span>{error}</span>
          <button type="button" onClick={onDismissError}>关闭</button>
        </div>
      ) : null}

      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={onUpdateSettings}
      />
      <RulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} />
      <ResultDialog
        open={resultOpen && game.status === 'finished'}
        onClose={() => setResultOpen(false)}
        resultTone={resultTone}
        resultTitle={resultTitle}
        winnerName={resultWinner ? resultWinner.name : ''}
        winnerPiece={resultWinner ? resultWinner.piece : ''}
        reason={resultReason}
        onAction={mode === 'online' ? onRematch : () => {
          onRestart();
          setResultOpen(false);
        }}
        actionLabel={resultActionLabel}
        actionDisabled={mode === 'online' && rematchVotes.includes(seat)}
        showAction={mode !== 'online' || isOnlinePlayer}
        onMenu={() => historyNavigation.push('/')}
      />
      <Modal open={restartOpen} title="重新开局" onClose={() => setRestartOpen(false)} className="confirm-modal">
        <p>当前棋谱会被清空。</p>
        <footer className="modal__actions">
          <button type="button" className="button button--ghost" onClick={() => setRestartOpen(false)}>取消</button>
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              onRestart();
              setRestartOpen(false);
            }}
          >
            <FiRefreshCw />
            重新开局
          </button>
        </footer>
      </Modal>
    </div>
  );
}

export function LocalGamePage({ mode, settings, onUpdateSettings, history }) {
  const local = useLocalGame(mode, settings);
  const playerData = settings.names.map((name, player) => ({
    name,
    piece: settings.pieces[player],
    connected: true,
    present: true,
  }));
  return (
    <GameWorkspace
      mode={mode}
      game={local.game}
      history={local.history}
      playerData={playerData}
      localPlayers={local.localPlayers}
      onMove={local.move}
      onUndo={local.undo}
      canUndo={local.canUndo}
      onRestart={local.restart}
      thinking={local.thinking}
      settings={settings}
      onUpdateSettings={onUpdateSettings}
      historyNavigation={history}
    />
  );
}

export function OnlineGamePage({ roomId, settings, onUpdateSettings, history }) {
  const online = useOnlineRoom(roomId, settings);
  const playerData = [0, 1].map((player) => {
    const serverPlayer = online.players[player];
    return {
      name: serverPlayer ? serverPlayer.name : player === 0 ? '等待棋手一' : '等待棋手二',
      piece: serverPlayer ? serverPlayer.piece : settings.pieces[player],
      connected: serverPlayer ? serverPlayer.connected : false,
      present: Boolean(serverPlayer),
    };
  });
  return (
    <GameWorkspace
      mode="online"
      roomId={roomId}
      game={online.game}
      history={online.history}
      playerData={playerData}
      localPlayers={online.localPlayers}
      onMove={online.move}
      connection={online.connection}
      seat={online.seat}
      rematchVotes={online.rematchVotes}
      onRematch={online.rematch}
      error={online.error}
      onDismissError={online.dismissError}
      settings={settings}
      onUpdateSettings={onUpdateSettings}
      historyNavigation={history}
    />
  );
}
