import React, { useEffect, useMemo, useState } from 'react';
import {
  FiChevronRight,
  FiCpu,
  FiHelpCircle,
  FiLogIn,
  FiMaximize,
  FiSettings,
  FiUsers,
  FiWifi,
} from 'react-icons/fi';

import BoardCanvas from '../game/BoardCanvas';
import { createRoomCode, normalizeRoomCode, toggleFullscreen } from '../game/browser';
import { applyTheme, THEME_PRESETS } from '../game/settings';
import { RulesDialog, SettingsDialog } from '../components/GameDialogs';
import IconButton from '../components/IconButton';

const rulesModule = require('../game/rules');

const { createInitialGame } = rulesModule;

function ModeButton({ icon, label, meta, onClick }) {
  return (
    <button type="button" className="mode-button" onClick={onClick}>
      <span className="mode-button__icon" aria-hidden="true">{icon}</span>
      <span className="mode-button__label">{label}</span>
      <span className="mode-button__meta">{meta}</span>
      <FiChevronRight aria-hidden="true" />
    </button>
  );
}

export default function HomePage({ history, settings, onUpdateSettings }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [roomError, setRoomError] = useState('');
  const previewGame = useMemo(() => createInitialGame(), []);

  useEffect(() => {
    window.render_game_to_text = () => JSON.stringify({
      screen: 'menu',
      title: '熊蛙棋',
      availableModes: ['local', 'ai', 'online'],
      selectedPieces: settings.pieces,
      selectedNames: settings.names,
    });
    return () => { delete window.render_game_to_text; };
  }, [settings]);

  const joinRoom = () => {
    const normalized = normalizeRoomCode(roomCode);
    if (normalized.length < 4) {
      setRoomError('请输入有效房间号');
      return;
    }
    history.push(`/room/${normalized}`);
  };

  return (
    <div className="app-shell home-screen">
      <div
        className="background-wash"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/forest-table.png)` }}
      />
      <header className="topbar topbar--home">
        <a className="brand-lockup" href="#/" aria-label="熊蛙棋主页">
          <span className="brand-lockup__mark">熊蛙棋</span>
          <span className="brand-lockup__edition">FOREST TABLE</span>
        </a>
        <div className="topbar__actions">
          <IconButton label="规则" onClick={() => setRulesOpen(true)}><FiHelpCircle /></IconButton>
          <IconButton label="棋局设置" onClick={() => setSettingsOpen(true)}><FiSettings /></IconButton>
          <IconButton label="全屏" onClick={toggleFullscreen}><FiMaximize /></IconButton>
        </div>
      </header>

      <main className="home-layout">
        <section className="home-menu" aria-labelledby="home-title">
          <p className="eyebrow">4 × 4 林地棋局</p>
          <h1 id="home-title">熊蛙棋</h1>
          <div className="mode-list" aria-label="选择对局模式">
            <ModeButton
              icon={<FiUsers />}
              label="本地双人"
              meta="LOCAL"
              onClick={() => history.push('/play/local')}
            />
            <ModeButton
              icon={<FiCpu />}
              label="挑战 AI"
              meta={settings.aiDifficulty === 'smart' ? 'SMART' : 'RELAXED'}
              onClick={() => history.push('/play/ai')}
            />
            <ModeButton
              icon={<FiWifi />}
              label="创建联机房间"
              meta="ONLINE"
              onClick={() => history.push(`/room/${createRoomCode()}`)}
            />
          </div>

          <div className="join-room">
            <label htmlFor="room-code">房间号</label>
            <div className="join-room__controls">
              <input
                id="room-code"
                value={roomCode}
                placeholder="例如 A7KF2Q"
                autoComplete="off"
                inputMode="text"
                onChange={(event) => {
                  setRoomCode(normalizeRoomCode(event.target.value));
                  setRoomError('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') joinRoom();
                }}
              />
              <IconButton label="加入房间" onClick={joinRoom}><FiLogIn /></IconButton>
            </div>
            <span className="field-error" role="alert">{roomError}</span>
          </div>

          <div className="quick-themes" aria-label="棋子主题">
            {THEME_PRESETS.map((theme) => (
              <button
                type="button"
                key={theme.id}
                className={settings.themeId === theme.id ? 'is-active' : ''}
                aria-label={`${theme.name}主题 ${theme.pieces.join('和')}`}
                title={theme.name}
                onClick={() => onUpdateSettings(applyTheme(settings, theme.id))}
              >
                {theme.pieces.join(' ')}
              </button>
            ))}
          </div>
        </section>

        <section className="home-board" aria-label="当前棋子预览">
          <div className="preview-turn">
            <span className="player-dot player-dot--0" />
            <span>{settings.names[0]}</span>
            <strong>{settings.pieces[0]}</strong>
          </div>
          <BoardCanvas game={previewGame} pieces={settings.pieces} preview disabled />
          <div className="preview-opponent">
            <span>{settings.pieces[1]}</span>
            <span>{settings.names[1]}</span>
          </div>
        </section>
      </main>

      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={onUpdateSettings}
      />
      <RulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
