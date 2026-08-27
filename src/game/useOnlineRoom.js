import { useCallback, useEffect, useRef, useState } from 'react';

import { OnlineRoomClient } from './onlineClient';

const rulesModule = require('./rules');

const { createInitialGame } = rulesModule;

const INITIAL_ROOM = {
  connection: 'connecting',
  game: createInitialGame(),
  history: [],
  players: [null, null],
  rematchVotes: [],
  revision: 0,
  seat: null,
  error: null,
};

export default function useOnlineRoom(roomId, settings) {
  const clientRef = useRef(null);
  const [room, setRoom] = useState(INITIAL_ROOM);

  useEffect(() => {
    setRoom(INITIAL_ROOM);
    const client = new OnlineRoomClient({
      roomId,
      settings,
      onStatus: (connection) => setRoom((current) => ({ ...current, connection })),
      onMessage: (message) => {
        if (message.type === 'welcome' || message.type === 'snapshot') {
          setRoom((current) => ({
            ...current,
            connection: 'online',
            game: message.game,
            history: message.history || [],
            players: message.players || [null, null],
            rematchVotes: message.rematchVotes || [],
            revision: message.revision,
            seat: message.type === 'welcome' ? message.seat : current.seat,
            error: null,
          }));
        } else if (message.type === 'error') {
          setRoom((current) => ({ ...current, error: message.message || '联机操作失败' }));
        } else if (message.type === 'session_replaced') {
          setRoom((current) => ({ ...current, connection: 'replaced' }));
        }
      },
    });
    clientRef.current = client;
    client.connect();
    return () => {
      client.close();
      clientRef.current = null;
    };
  }, [roomId]);

  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;
    client.updateSettings(settings);
    if (room.seat === 0 || room.seat === 1) {
      client.updateProfile(settings.names[room.seat], settings.pieces[room.seat]);
    }
  }, [room.seat, settings]);

  const move = useCallback((from, to) => {
    const client = clientRef.current;
    if (client) client.move(from, to, room.revision);
  }, [room.revision]);

  const rematch = useCallback(() => {
    if (clientRef.current) clientRef.current.rematch();
  }, []);

  const retry = useCallback(() => {
    if (clientRef.current) clientRef.current.sync();
  }, []);

  const dismissError = useCallback(() => {
    setRoom((current) => ({ ...current, error: null }));
  }, []);

  return {
    ...room,
    localPlayers: room.seat === 0 || room.seat === 1 ? [room.seat] : [],
    move,
    rematch,
    retry,
    dismissError,
  };
}
