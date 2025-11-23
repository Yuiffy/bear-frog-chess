import { RESET, UPDATE_SOCKET } from './actionTypes.js';

export const reset = () => ({
  type: RESET,
});

export const updateSocket = (socketClient) => ({
  socketClient,
  type: UPDATE_SOCKET,
});
