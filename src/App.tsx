import React, { useState } from 'react';
import { BoardVisualization } from './ui/BoardVisualization';
import GamePage from './pages/GamePage';
import './App.css';

function App() {
  const [useNewLayout, setUseNewLayout] = useState(false);

  return (
    <div className="App">
      {/* Toggle button to switch between layouts */}
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="checkbox" 
            checked={useNewLayout}
            onChange={(e) => setUseNewLayout(e.target.checked)}
          />
          Use New Layout
        </label>
      </div>

      {/* Render the appropriate layout */}
      {useNewLayout ? <GamePage /> : <BoardVisualization />}
    </div>
  );
}

export default App;