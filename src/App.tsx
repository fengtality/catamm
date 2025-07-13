import React, { useState } from 'react';
import { BoardVisualization } from './ui/BoardVisualization';
import GamePage from './pages/GamePage';
import { Button } from '@/components/ui/button';
import './App.css';

function App() {
  const [useNewLayout, setUseNewLayout] = useState(true);

  return (
    <div className="App">
      {/* Toggle button to switch between layouts */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant={useNewLayout ? "default" : "secondary"}
          size="sm"
          onClick={() => setUseNewLayout(!useNewLayout)}
          className="font-mono"
        >
          {useNewLayout ? 'New Layout' : 'Old Layout'}
        </Button>
      </div>

      {/* Render the appropriate layout */}
      {useNewLayout ? <GamePage /> : <BoardVisualization />}
    </div>
  );
}

export default App;