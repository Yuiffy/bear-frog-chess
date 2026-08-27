import React, { useEffect, useState } from 'react';
import {
  FiArrowLeft, FiCheck, FiRefreshCw, FiX,
} from 'react-icons/fi';

import IconButton from './IconButton';
import { applyTheme, THEME_PRESETS } from '../game/settings';

export function Modal({
  open, title, onClose, children, className = '',
}) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, open]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <h2 id="modal-title">{title}</h2>
          <IconButton label="关闭" onClick={onClose}><FiX /></IconButton>
        </header>
        {children}
      </section>
    </div>
  );
}

export function SettingsDialog({
  open, settings, onClose, onSave,
}) {
  const [draft, setDraft] = useState(settings);
  useEffect(() => {
    if (open) setDraft(settings);
  }, [open, settings]);

  const setSideValue = (field, index, value) => {
    setDraft((current) => {
      const values = current[field].slice();
      values[index] = value;
      return { ...current, [field]: values, themeId: 'custom' };
    });
  };

  return (
    <Modal open={open} title="棋局设置" onClose={onClose} className="settings-modal">
      <div className="settings-section">
        <h3>棋子主题</h3>
        <div className="theme-options" role="radiogroup" aria-label="棋子主题">
          {THEME_PRESETS.map((theme) => (
            <button
              type="button"
              role="radio"
              aria-checked={draft.themeId === theme.id}
              className={`theme-option${draft.themeId === theme.id ? ' is-active' : ''}`}
              key={theme.id}
              onClick={() => setDraft(applyTheme(draft, theme.id))}
            >
              <span className="theme-option__pieces" aria-hidden="true">{theme.pieces.join(' · ')}</span>
              <span>{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>双方</h3>
        {[0, 1].map((player) => (
          <div className="player-editor" key={player}>
            <span className={`player-dot player-dot--${player}`} aria-hidden="true" />
            <label>
              <span>名称</span>
              <input
                value={draft.names[player]}
                maxLength={12}
                onChange={(event) => setSideValue('names', player, event.target.value)}
              />
            </label>
            <label className="piece-input">
              <span>棋子</span>
              <input
                value={draft.pieces[player]}
                maxLength={4}
                onChange={(event) => setSideValue('pieces', player, event.target.value)}
              />
            </label>
          </div>
        ))}
      </div>

      <div className="settings-section settings-section--split">
        <div>
          <h3>AI 难度</h3>
          <div className="segmented-control">
            <button
              type="button"
              className={draft.aiDifficulty === 'relaxed' ? 'is-active' : ''}
              onClick={() => setDraft({ ...draft, aiDifficulty: 'relaxed' })}
            >
              轻松
            </button>
            <button
              type="button"
              className={draft.aiDifficulty === 'smart' ? 'is-active' : ''}
              onClick={() => setDraft({ ...draft, aiDifficulty: 'smart' })}
            >
              认真
            </button>
          </div>
        </div>
        <div>
          <h3>AI 对局座位</h3>
          <div className="segmented-control">
            <button
              type="button"
              className={draft.humanSide === 0 ? 'is-active' : ''}
              onClick={() => setDraft({ ...draft, humanSide: 0 })}
            >
              先手
            </button>
            <button
              type="button"
              className={draft.humanSide === 1 ? 'is-active' : ''}
              onClick={() => setDraft({ ...draft, humanSide: 1 })}
            >
              后手
            </button>
          </div>
        </div>
      </div>

      <footer className="modal__actions">
        <button type="button" className="button button--ghost" onClick={onClose}>取消</button>
        <button
          type="button"
          className="button button--primary"
          onClick={() => {
            onSave(draft);
            onClose();
          }}
        >
          <FiCheck />
          保存
        </button>
      </footer>
    </Modal>
  );
}

export function ResultDialog({
  open,
  onClose,
  resultTone,
  resultTitle,
  winnerName,
  winnerPiece,
  reason,
  onAction,
  actionLabel,
  actionDisabled = false,
  showAction = true,
  onMenu,
}) {
  return (
    <Modal open={open} title="对局结果" onClose={onClose} className={`result-modal result-modal--${resultTone}`}>
      <div className="result-modal__body">
        <div className="result-modal__mark" aria-hidden="true">
          <span>{winnerPiece}</span>
        </div>
        <h3 className="result-modal__title">{resultTitle}</h3>
        <p className="result-modal__winner">
          <span className="result-modal__winner-label">获胜方</span>
          {winnerName}
        </p>
        <p className="result-modal__reason">{reason}</p>
      </div>
      <footer className="modal__actions result-modal__actions">
        <button type="button" className="button button--ghost" onClick={onMenu}>
          <FiArrowLeft />
          返回主菜单
        </button>
        {showAction ? (
          <button
            type="button"
            className="button button--primary"
            disabled={actionDisabled}
            onClick={onAction}
          >
            <FiRefreshCw />
            {actionLabel}
          </button>
        ) : null}
      </footer>
    </Modal>
  );
}

export function RulesDialog({ open, onClose }) {
  return (
    <Modal open={open} title="规则" onClose={onClose} className="rules-modal">
      <div className="rule-formation" aria-label="两个相邻己方棋子可以击破直线相邻敌方棋子">
        <span className="formation-piece formation-piece--0">🐻</span>
        <span className="formation-piece formation-piece--0">🐻</span>
        <span className="formation-piece formation-piece--1">🐸</span>
        <span className="formation-burst">×</span>
      </div>
      <ol className="rule-list">
        <li>每回合把一颗己方棋子移动到上下左右相邻的空位。</li>
        <li>移动后，两颗相邻己方棋子形成炮台，击破同一直线上紧邻的敌方棋子。</li>
        <li>连续四颗棋子会挡住炮火。只剩一颗棋子或无路可走的一方落败。</li>
      </ol>
    </Modal>
  );
}
