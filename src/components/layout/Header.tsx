import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ViewOptions } from '../shared/types'

interface HeaderProps {
  viewOptions: ViewOptions
  onViewOptionsChange: (options: ViewOptions) => void
  onNewBoard: (boardSize?: number) => void
  onCenterView: () => void
  darkMode: boolean
  toggleDarkMode: () => void
  onSkipSetup?: () => void
}

export default function Header({ viewOptions, onViewOptionsChange, onNewBoard, onCenterView, darkMode, toggleDarkMode, onSkipSetup }: HeaderProps) {

  return (
    <header className={cn("h-16 bg-background border-b border-border flex items-center justify-between px-6")}>
      {/* Logo Section */}
      <div className="flex items-center">
        <h1 className="text-2xl font-mono font-bold">CATAMM</h1>
        <span className="ml-2 text-sm text-muted-foreground font-mono">Catan + AMM</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="font-mono"
        >
          {darkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </Button>

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="font-mono">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 font-mono">
            <DropdownMenuLabel>View Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={viewOptions.showVertices}
              onCheckedChange={(checked) =>
                onViewOptionsChange({ ...viewOptions, showVertices: checked })
              }
            >
              Show Vertices
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={viewOptions.showHexNumbers}
              onCheckedChange={(checked) =>
                onViewOptionsChange({ ...viewOptions, showHexNumbers: checked })
              }
            >
              Show Hex Index
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={viewOptions.showPortable}
              onCheckedChange={(checked) =>
                onViewOptionsChange({ ...viewOptions, showPortable: checked })
              }
            >
              Show Portable Vertices
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={viewOptions.showSelectionInfo}
              onCheckedChange={(checked) =>
                onViewOptionsChange({ ...viewOptions, showSelectionInfo: checked })
              }
            >
              Show Selection Info
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Board Size</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => {
              onViewOptionsChange({ ...viewOptions, boardSize: 2 })
              onNewBoard(2)
            }}>
              2 rings (19 hexes)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              onViewOptionsChange({ ...viewOptions, boardSize: 3 })
              onNewBoard(3)
            }}>
              3 rings (37 hexes)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              onViewOptionsChange({ ...viewOptions, boardSize: 4 })
              onNewBoard(4)
            }}>
              4 rings (61 hexes)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              onViewOptionsChange({ ...viewOptions, boardSize: 5 })
              onNewBoard(5)
            }}>
              5 rings (91 hexes)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onCenterView}>
              Center View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSkipSetup?.()}>
              Skip Setup (Testing)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Connect Button */}
        <Button variant="ghost" className="font-mono">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Connect
        </Button>
      </div>
    </header>
  )
}