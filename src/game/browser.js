const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function createRoomCode(length = 6) {
  const values = new Uint8Array(length);
  if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(values);
  else values.forEach((value, index) => { values[index] = Math.floor(Math.random() * 256); });
  return Array.from(values, (value) => ROOM_ALPHABET[value % ROOM_ALPHABET.length]).join('');
}

function normalizeRoomCode(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-HJ-NP-Z2-9]/g, '')
    .slice(0, 10);
}

function getInviteUrl(roomId) {
  return `${window.location.origin}${window.location.pathname}#/room/${roomId}`;
}

async function copyText(value) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const input = document.createElement('textarea');
  input.value = value;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}

async function toggleFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await document.documentElement.requestFullscreen();
  }
}

const browserModule = {
  copyText,
  createRoomCode,
  getInviteUrl,
  normalizeRoomCode,
  toggleFullscreen,
};

export {
  copyText,
  createRoomCode,
  getInviteUrl,
  normalizeRoomCode,
  toggleFullscreen,
};

export default browserModule;
