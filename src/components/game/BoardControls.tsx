
import React from 'react'
import { ViewOptions } from '../shared/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select } from '@/components/ui/select'

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
    <div className="bg-background p-4 border-t border-border">
      <div className="flex items-center justify-between">
        {/* View Options */}
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2">
            <Checkbox
              checked={viewOptions.showVertices}
              onCheckedChange={(checked) =>
                onViewOptionsChange({ ...viewOptions, showVertices: checked as boolean })
              }
            />
            <span className="text-sm font-mono">Show Vertices</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <Checkbox
              checked={viewOptions.showHexNumbers}
              onCheckedChange={(checked) =>
                onViewOptionsChange({ ...viewOptions, showHexNumbers: checked as boolean })
              }
            />
            <span className="text-sm font-mono">Show Hex Numbers</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <Checkbox
              checked={viewOptions.showPortable}
              onCheckedChange={(checked) =>
                onViewOptionsChange({ ...viewOptions, showPortable: checked as boolean })
              }
            />
            <span className="text-sm font-mono">Show Portable Vertices</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <span className="text-sm font-mono">Board Size:</span>
            <Select
              value={viewOptions.boardSize.toString()}
              onChange={(e) =>
                onViewOptionsChange({ ...viewOptions, boardSize: parseInt(e.target.value) })
              }
            >
              <option value="2">2 rings (19 hexes)</option>
              <option value="3">3 rings (37 hexes)</option>
              <option value="4">4 rings (61 hexes)</option>
              <option value="5">5 rings (91 hexes)</option>
            </Select>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={onNewBoard}
            size="sm"
          >
            New Board
          </Button>
          <Button
            onClick={onCenterView}
            variant="secondary"
            size="sm"
          >
            Center View
          </Button>
          <span className="text-xs text-muted-foreground font-mono ml-4">
            Drag to pan around the board
          </span>
        </div>
      </div>
    </div>
  )
}