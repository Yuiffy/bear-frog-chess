import React, { useEffect, useState } from 'react';
import {
  Redirect, Route, Switch,
} from 'react-router-dom';

import HomePage from './pages/HomePage';
import { LocalGamePage, OnlineGamePage } from './pages/GamePage';
import { loadSettings, saveSettings } from './game/settings';
import { normalizeRoomCode, toggleFullscreen } from './game/browser';
import './styles.css';

function App() {
  const [settings, setSettings] = useState(loadSettings);

  const updateSettings = (nextSettings) => setSettings(saveSettings(nextSettings));

  useEffect(() => {
    window.__bearFrogTimeOffset = 0;
    window.advanceTime = (milliseconds) => {
      window.__bearFrogTimeOffset += Number(milliseconds) || 0;
      window.dispatchEvent(new CustomEvent('bear-frog-tick'));
    };
    const handleFullscreenShortcut = (event) => {
      const target = event.target;
      const typing = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (!typing && event.key.toLowerCase() === 'f') toggleFullscreen();
    };
    window.addEventListener('keydown', handleFullscreenShortcut);
    return () => {
      delete window.advanceTime;
      window.removeEventListener('keydown', handleFullscreenShortcut);
    };
  }, []);

  return (
    <Switch>
      <Route
        exact
        path="/"
        render={(routeProps) => (
          <HomePage {...routeProps} settings={settings} onUpdateSettings={updateSettings} />
        )}
      />
      <Route
        exact
        path="/play/:mode(local|ai)"
        render={(routeProps) => (
          <LocalGamePage
            {...routeProps}
            mode={routeProps.match.params.mode}
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}
      />
      <Route
        exact
        path="/room/:roomId"
        render={(routeProps) => {
          const roomId = normalizeRoomCode(routeProps.match.params.roomId);
          return roomId.length >= 4 ? (
            <OnlineGamePage
              {...routeProps}
              roomId={roomId}
              settings={settings}
              onUpdateSettings={updateSettings}
            />
          ) : <Redirect to="/" />;
        }}
      />
      <Route exact path="/local" render={() => <Redirect to="/play/local" />} />
      <Route path="/local-ai/:hasAI/:playerId" render={() => <Redirect to="/play/ai" />} />
      <Route
        path="/online/:roomId/:playerId"
        render={({ match }) => <Redirect to={`/room/${normalizeRoomCode(match.params.roomId)}`} />}
      />
      <Redirect to="/" />
    </Switch>
  );
}

export default App;
