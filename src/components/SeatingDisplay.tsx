import { useState } from 'react';
import { SeatingResult } from '../js/seatingAlgorithm';

interface SubjectDisplay {
  name: string;
  count: number;
  color: string;
}

interface SeatingDisplayProps {
  result: SeatingResult;
  activeRoom: number;
  setActiveRoom: (index: number) => void;
  subjects: SubjectDisplay[];
}

export default function SeatingDisplay({ result, activeRoom, setActiveRoom, subjects }: SeatingDisplayProps) {
  const [showLegend, setShowLegend] = useState(true);
  const room = result.rooms[activeRoom];

  if (!room) return null;

  return (
    <div className="space-y-4">
      {/* Room Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {result.rooms.map((r, idx) => (
          <button
            key={idx}
            onClick={() => setActiveRoom(idx)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeRoom === idx
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
            }`}
          >
            {r.name}
            <span className="ml-1 text-xs opacity-75">({r.occupied})</span>
          </button>
        ))}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="ml-auto px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs text-slate-300 transition-colors"
        >
          {showLegend ? '🔽 Hide Legend' : '▶ Show Legend'}
        </button>
      </div>

      {/* Subject Legend */}
      {showLegend && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Subject Legend</h3>
          <div className="flex flex-wrap gap-3">
            {subjects.map((subject, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-700/30 rounded-lg px-3 py-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: subject.color }} />
                <span className="text-xs text-slate-300">{subject.name}</span>
                <span className="text-xs text-slate-500">({subject.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seating Grid */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{room.name}</h3>
          <span className="text-sm text-slate-400">
            {room.rows} × {room.cols} | {room.occupied} occupied
          </span>
        </div>

        {/* Front Label */}
        <div className="text-center mb-4">
          <div className="inline-block bg-slate-700/50 px-6 py-1.5 rounded-lg text-xs text-slate-400 border border-slate-600/50">
            📋 FRONT — Invigilator
          </div>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-block min-w-full">
            {room.grid.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center items-center gap-1 mb-1">
                <span className="w-7 text-right text-xs text-slate-500 mr-1 flex-shrink-0">
                  R{rowIdx + 1}
                </span>
                {row.map((seat, colIdx) => (
                  <div key={colIdx} className="relative group">
                    <div
                      className={`w-11 h-9 sm:w-14 sm:h-10 rounded-lg flex items-center justify-center text-xs font-medium border-2 transition-all ${
                        seat
                          ? 'cursor-pointer hover:scale-110 hover:z-10'
                          : 'bg-slate-700/30 border-slate-600/30'
                      }`}
                      style={
                        seat
                          ? {
                              backgroundColor: (seat.color || '#6B7280') + '25',
                              borderColor: (seat.color || '#6B7280') + '60',
                            }
                          : undefined
                      }
                    >
                      {seat ? (
                        <span className="text-white truncate px-1" style={{ fontSize: '9px' }}>
                          {seat.rollNo.split('-')[1]}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </div>

                    {/* Tooltip */}
                    {seat && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                        <div className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                          <p className="font-bold text-white">{seat.rollNo}</p>
                          <p style={{ color: seat.color || '#6B7280' }}>{seat.subject}</p>
                          <p className="text-slate-400">Row {rowIdx + 1}, Seat {colIdx + 1}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors flex items-center gap-2"
          >
            🖨️ Print
          </button>
        </div>
      </div>
    </div>
  );
}
