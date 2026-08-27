const STORAGE_KEY = 'bear-frog-chess:settings:v2';

const THEME_PRESETS = [
  {
    id: 'forest',
    name: '林地',
    pieces: ['🐻', '🐸'],
    names: ['熊方', '蛙方'],
  },
  {
    id: 'meadow',
    name: '原野',
    pieces: ['🦊', '🐰'],
    names: ['狐方', '兔方'],
  },
  {
    id: 'tide',
    name: '潮汐',
    pieces: ['🐳', '🐙'],
    names: ['鲸方', '章方'],
  },
  {
    id: 'night',
    name: '夜行',
    pieces: ['🐱', '🐧'],
    names: ['猫方', '鹅方'],
  },
];

const DEFAULT_SETTINGS = {
  themeId: 'forest',
  pieces: THEME_PRESETS[0].pieces,
  names: THEME_PRESETS[0].names,
  aiDifficulty: 'smart',
  humanSide: 0,
};

function cleanShortText(value, fallback, maxLength) {
  if (typeof value !== 'string') return fallback;
  const cleaned = Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join('')
    .trim();
  return Array.from(cleaned).slice(0, maxLength).join('') || fallback;
}

function normalizeSettings(input = {}) {
  return {
    themeId: typeof input.themeId === 'string' ? input.themeId : DEFAULT_SETTINGS.themeId,
    pieces: [
      cleanShortText(input.pieces && input.pieces[0], DEFAULT_SETTINGS.pieces[0], 2),
      cleanShortText(input.pieces && input.pieces[1], DEFAULT_SETTINGS.pieces[1], 2),
    ],
    names: [
      cleanShortText(input.names && input.names[0], DEFAULT_SETTINGS.names[0], 12),
      cleanShortText(input.names && input.names[1], DEFAULT_SETTINGS.names[1], 12),
    ],
    aiDifficulty: input.aiDifficulty === 'relaxed' ? 'relaxed' : 'smart',
    humanSide: input.humanSide === 1 ? 1 : 0,
  };
}

function loadSettings() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeSettings(JSON.parse(saved)) : normalizeSettings(DEFAULT_SETTINGS);
  } catch (error) {
    return normalizeSettings(DEFAULT_SETTINGS);
  }
}

function saveSettings(settings) {
  const normalized = normalizeSettings(settings);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    // The game still works when storage is disabled.
  }
  return normalized;
}

function applyTheme(settings, themeId) {
  const theme = THEME_PRESETS.find((item) => item.id === themeId) || THEME_PRESETS[0];
  return normalizeSettings({
    ...settings,
    themeId: theme.id,
    pieces: theme.pieces,
    names: theme.names,
  });
}

const settingsModule = {
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  THEME_PRESETS,
  applyTheme,
  loadSettings,
  normalizeSettings,
  saveSettings,
};

export {
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  THEME_PRESETS,
  applyTheme,
  loadSettings,
  normalizeSettings,
  saveSettings,
};

export default settingsModule;
