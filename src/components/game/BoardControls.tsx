
import React from 'react'
import { ViewOptions } from '../shared/types'

interface BoardControlsProps {
  viewOptions: ViewOptions
  onViewOptionsChange: (options: ViewOptions) => void
  onNewBoard: () => void
  onCenterView: () => void
}

export default function BoardControls({
  viewOptions,
  onViewOptionsChange,
  onNewBoard,
  onCenterView
}: BoardControlsProps) {
  return (
    <div className="bg-white p-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        {/* View Options */}
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={viewOptions.showVertices}
              onChange={(e) =>
                onViewOptionsChange({ ...viewOptions, showVertices: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">Show Vertices</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={viewOptions.showHexNumbers}
              onChange={(e) =>
                onViewOptionsChange({ ...viewOptions, showHexNumbers: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">Show Hex Numbers</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={viewOptions.showPortable}
              onChange={(e) =>
                onViewOptionsChange({ ...viewOptions, showPortable: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">Show Portable Vertices</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <span className="text-sm">Board Size:</span>
            <select
              value={viewOptions.boardSize}
              onChange={(e) =>
                onViewOptionsChange({ ...viewOptions, boardSize: parseInt(e.target.value) })
              }
              className="rounded border-gray-300 text-sm"
            >
              <option value={2}>2 rings (19 hexes)</option>
              <option value={3}>3 rings (37 hexes)</option>
              <option value={4}>4 rings (61 hexes)</option>
              <option value={5}>5 rings (91 hexes)</option>
            </select>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onNewBoard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            New Board
          </button>
          <button
            onClick={onCenterView}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Center View
          </button>
          <span className="text-xs text-gray-500 ml-4">
            Drag to pan around the board
          </span>
        </div>
      </div>
    </div>
  )
}