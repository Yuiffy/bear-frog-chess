import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

const rulesModule = require('./rules');

const { BOARD_SIZE, positionToLabel, samePosition } = rulesModule;

const TEAM_COLORS = ['#e7604f', '#147b70'];
const TEAM_DARK_COLORS = ['#8f3028', '#0b4f49'];

function roundedRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function boardToDisplay(position, orientation) {
  if (orientation !== 1) return position;
  return {
    row: BOARD_SIZE - 1 - position.row,
    col: BOARD_SIZE - 1 - position.col,
  };
}

function displayToBoard(position, orientation) {
  return boardToDisplay(position, orientation);
}

function layoutForSize(size) {
  const padding = Math.max(28, size * 0.065);
  const boardSize = size - padding * 2;
  const gap = Math.max(4, size * 0.009);
  const cellSize = boardSize / BOARD_SIZE;
  return {
    padding,
    boardSize,
    gap,
    cellSize,
  };
}

function drawBurst(context, x, y, radius, progress) {
  context.save();
  context.strokeStyle = `rgba(242, 193, 78, ${1 - progress})`;
  context.lineWidth = Math.max(2, radius * 0.06);
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8;
    const inner = radius * (0.25 + progress * 0.3);
    const outer = radius * (0.48 + progress * 0.5);
    context.beginPath();
    context.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
    context.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
    context.stroke();
  }
  context.restore();
}

function renderBoard({
  canvas,
  game,
  pieces,
  selected,
  legalDestinations,
  orientation,
  cursor,
  disabled,
  reducedMotion,
}) {
  const bounds = canvas.getBoundingClientRect();
  const size = Math.max(280, Math.round(Math.min(bounds.width, bounds.height || bounds.width)));
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const bitmapSize = Math.round(size * pixelRatio);
  if (canvas.width !== bitmapSize || canvas.height !== bitmapSize) {
    canvas.width = bitmapSize;
    canvas.height = bitmapSize;
  }

  const context = canvas.getContext('2d');
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, size, size);
  context.fillStyle = '#14201e';
  roundedRect(context, 0, 0, size, size, Math.max(6, size * 0.018));
  context.fill();

  const layout = layoutForSize(size);
  const { padding, cellSize, gap } = layout;
  const now = performance.now() + (window.__bearFrogTimeOffset || 0);
  const pulse = reducedMotion ? 0.5 : (Math.sin(now / 240) + 1) / 2;

  for (let displayRow = 0; displayRow < BOARD_SIZE; displayRow += 1) {
    for (let displayCol = 0; displayCol < BOARD_SIZE; displayCol += 1) {
      const position = displayToBoard({ row: displayRow, col: displayCol }, orientation);
      const x = padding + displayCol * cellSize + gap / 2;
      const y = padding + displayRow * cellSize + gap / 2;
      const innerSize = cellSize - gap;
      const isLastFrom = game.lastMove && samePosition(game.lastMove.from, position);
      const isLastTo = game.lastMove && samePosition(game.lastMove.to, position);
      const isLegal = legalDestinations.some((item) => samePosition(item, position));
      const isSelected = selected && samePosition(selected, position);
      const isCursor = cursor && samePosition(cursor, { row: displayRow, col: displayCol });

      if (isSelected) context.fillStyle = '#f2c14e';
      else if (isLastTo) context.fillStyle = '#f0cdbf';
      else if (isLastFrom) context.fillStyle = '#b9cec4';
      else context.fillStyle = (displayRow + displayCol) % 2 === 0 ? '#f2f1e9' : '#dce7e0';
      roundedRect(context, x, y, innerSize, innerSize, Math.max(4, size * 0.012));
      context.fill();

      if (isCursor) {
        context.strokeStyle = '#ffffff';
        context.lineWidth = Math.max(2, size * 0.005);
        roundedRect(context, x + 3, y + 3, innerSize - 6, innerSize - 6, Math.max(3, size * 0.01));
        context.stroke();
      }

      const player = game.board[position.row][position.col];
      if (player === 0 || player === 1) {
        const centerX = x + innerSize / 2;
        const centerY = y + innerSize / 2;
        const radius = innerSize * 0.34;
        context.fillStyle = TEAM_DARK_COLORS[player];
        context.beginPath();
        context.arc(centerX, centerY + radius * 0.08, radius * 1.03, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = TEAM_COLORS[player];
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#f8f4ea';
        context.beginPath();
        context.arc(centerX, centerY, radius * 0.74, 0, Math.PI * 2);
        context.fill();
        context.font = `${Math.round(radius * 1.05)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#15211f';
        context.fillText(pieces[player] || '?', centerX, centerY + radius * 0.04);
      } else if (isLegal) {
        const dotRadius = innerSize * (0.075 + pulse * 0.025);
        context.fillStyle = '#226b51';
        context.beginPath();
        context.arc(x + innerSize / 2, y + innerSize / 2, dotRadius, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  context.fillStyle = 'rgba(242, 241, 233, 0.68)';
  context.font = `600 ${Math.max(10, Math.round(size * 0.022))}px "Microsoft YaHei", sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  for (let index = 0; index < BOARD_SIZE; index += 1) {
    const column = orientation === 1 ? BOARD_SIZE - 1 - index : index;
    context.fillText(String.fromCharCode(65 + column), padding + (index + 0.5) * cellSize, padding * 0.48);
    const logicalRow = orientation === 1 ? index : BOARD_SIZE - 1 - index;
    context.fillText(String(logicalRow + 1), padding * 0.48, padding + (index + 0.5) * cellSize);
  }

  if (game.lastMove && game.lastMove.captured.length > 0) {
    const elapsed = now - (window.__bearFrogLastMoveTime || now);
    const progress = Math.min(1, Math.max(0, elapsed / 620));
    if (progress < 1) {
      game.lastMove.captured.forEach((position) => {
        const display = boardToDisplay(position, orientation);
        drawBurst(
          context,
          padding + (display.col + 0.5) * cellSize,
          padding + (display.row + 0.5) * cellSize,
          cellSize * 0.42,
          progress,
        );
      });
    }
  }

  if (disabled) {
    context.fillStyle = 'rgba(20, 32, 30, 0.16)';
    roundedRect(context, padding, padding, layout.boardSize, layout.boardSize, Math.max(4, size * 0.012));
    context.fill();
  }
}

function BoardCanvas({
  game,
  pieces,
  selected,
  legalDestinations = [],
  onCell,
  onCancel,
  orientation = 0,
  disabled = false,
  preview = false,
}) {
  const canvasRef = useRef(null);
  const previousMoveRef = useRef(game.moveNumber);
  const [cursor, setCursor] = useState({ row: 3, col: 0 });
  const [focused, setFocused] = useState(false);
  const reducedMotion = useMemo(() => (
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ), []);

  useEffect(() => {
    if (game.moveNumber !== previousMoveRef.current) {
      window.__bearFrogLastMoveTime = performance.now() + (window.__bearFrogTimeOffset || 0);
      previousMoveRef.current = game.moveNumber;
    }
  }, [game.moveNumber]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let frame = null;
    const draw = () => {
      renderBoard({
        canvas,
        game,
        pieces,
        selected,
        legalDestinations,
        orientation,
        cursor: preview || !focused ? null : cursor,
        disabled,
        reducedMotion,
      });
      if (!reducedMotion) frame = window.requestAnimationFrame(draw);
    };
    draw();
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(draw)
      : null;
    if (resizeObserver) resizeObserver.observe(canvas);
    window.addEventListener('bear-frog-tick', draw);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('bear-frog-tick', draw);
    };
  }, [cursor, disabled, focused, game, legalDestinations, orientation, pieces, preview, reducedMotion, selected]);

  const activateDisplayPosition = useCallback((displayPosition) => {
    if (disabled || preview || !onCell) return;
    onCell(displayToBoard(displayPosition, orientation));
  }, [disabled, onCell, orientation, preview]);

  const handlePointer = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas || disabled || preview) return;
    canvas.focus();
    const bounds = canvas.getBoundingClientRect();
    const size = Math.min(bounds.width, bounds.height);
    const layout = layoutForSize(size);
    const x = event.clientX - bounds.left - layout.padding;
    const y = event.clientY - bounds.top - layout.padding;
    if (x < 0 || y < 0 || x >= layout.boardSize || y >= layout.boardSize) return;
    const nextCursor = {
      row: Math.floor(y / layout.cellSize),
      col: Math.floor(x / layout.cellSize),
    };
    setCursor(nextCursor);
    activateDisplayPosition(nextCursor);
  }, [activateDisplayPosition, disabled, preview]);

  const handleKeyDown = useCallback((event) => {
    if (disabled || preview) return;
    const directionMap = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    if (directionMap[event.key]) {
      event.preventDefault();
      const [rowDelta, colDelta] = directionMap[event.key];
      setCursor((current) => ({
        row: Math.max(0, Math.min(BOARD_SIZE - 1, current.row + rowDelta)),
        col: Math.max(0, Math.min(BOARD_SIZE - 1, current.col + colDelta)),
      }));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateDisplayPosition(cursor);
    } else if (event.key === 'Escape' && onCancel) {
      onCancel();
    }
  }, [activateDisplayPosition, cursor, disabled, onCancel, preview]);

  const cursorPosition = displayToBoard(cursor, orientation);
  const cursorValue = game.board[cursorPosition.row][cursorPosition.col];
  const cursorLabel = cursorValue === null ? '空位' : `${pieces[cursorValue]}棋子`;
  return (
    <canvas
      ref={canvasRef}
      className={`board-canvas${preview ? ' board-canvas--preview' : ''}`}
      data-testid="game-board"
      role="grid"
      tabIndex={preview ? -1 : 0}
      aria-label={`熊蛙棋棋盘，坐标原点为左上，当前焦点 ${positionToLabel(cursorPosition)}，${cursorLabel}`}
      onClick={handlePointer}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={handleKeyDown}
    />
  );
}

export default BoardCanvas;
