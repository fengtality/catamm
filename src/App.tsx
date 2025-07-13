import React, { useState } from 'react';
import { BoardVisualization } from './ui/BoardVisualization';
import { GoldbergBoardVisualization } from './ui/GoldbergBoardVisualization';
import './App.css';

function App() {
  const [use3DBoard, setUse3DBoard] = useState(true);
  
  return (
    <div className="App">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setUse3DBoard(!use3DBoard)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-lg"
        >
          Switch to {use3DBoard ? '2D' : '3D'} Board
        </button>
      </div>
      {use3DBoard ? <GoldbergBoardVisualization /> : <BoardVisualization />}
    </div>
  );
}

export default App;