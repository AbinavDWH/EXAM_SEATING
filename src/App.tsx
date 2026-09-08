import { useState, useCallback } from 'react';
import { Subject, SeatingResult, SeatingConfig, getSubjectColor, arrangeSeating } from './utils/seatingAlgorithm';

function App() {
  const [rooms, setRooms] = useState(2);
  const [rowsPerRoom, setRowsPerRoom] = useState(5);
  const [colsPerRoom, setColsPerRoom] = useState(6);
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: 'Mathematics', studentCount: 20, color: getSubjectColor(0) },
    { name: 'Physics', studentCount: 18, color: getSubjectColor(1) },
    { name: 'Chemistry', studentCount: 15, color: getSubjectColor(2) },
  ]);
  const [result, setResult] = useState<SeatingResult | null>(null);
  const [activeRoom, setActiveRoom] = useState(0);
  const [showLegend, setShowLegend] = useState(true);

  const addSubject = () => {
    const newIndex = subjects.length;
    setSubjects([
      ...subjects,
      { name: `Subject ${newIndex + 1}`, studentCount: 10, color: getSubjectColor(newIndex) },
    ]);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = (index: number, field: keyof Subject, value: string | number) => {
    const updated = [...subjects];
    if (field === 'name') {
      updated[index] = { ...updated[index], name: value as string };
    } else if (field === 'studentCount') {
      updated[index] = { ...updated[index], studentCount: value as number };
    } else if (field === 'color') {
      updated[index] = { ...updated[index], color: value as string };
    }
    setSubjects(updated);
  };

  const generateArrangement = useCallback(() => {
    const config: SeatingConfig = {
      rooms,
      rowsPerRoom,
      colsPerRoom,
      subjects,
    };
    const seatingResult = arrangeSeating(config);
    setResult(seatingResult);
    setActiveRoom(0);
  }, [rooms, rowsPerRoom, colsPerRoom, subjects]);

  const totalStudents = subjects.reduce((sum, s) => sum + s.studentCount, 0);
  const totalSeats = rooms * rowsPerRoom * colsPerRoom;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">Exam Seating Arrangement</h1>
            <p className="text-sm text-blue-300">Anti-cheating seat distribution system</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Configuration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Room Config */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Room Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Number of Rooms</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={rooms}
                  onChange={(e) => setRooms(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Rows per Room</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={rowsPerRoom}
                  onChange={(e) => setRowsPerRoom(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Columns per Room</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={colsPerRoom}
                  onChange={(e) => setColsPerRoom(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-blue-900/30 rounded-lg p-3 text-sm">
                <p className="text-blue-300">Total seats: <span className="font-bold text-white">{totalSeats}</span></p>
                <p className="text-blue-300">Total students: <span className="font-bold text-white">{totalStudents}</span></p>
                {totalStudents > totalSeats && (
                  <p className="text-red-400 mt-1">⚠️ Not enough seats!</p>
                )}
              </div>
            </div>
          </div>

          {/* Subject Config */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Subjects & Students
              </h2>
              <button
                onClick={addSubject}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
              >
                + Add Subject
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {subjects.map((subject, index) => (
                <div key={index} className="flex items-center gap-3 bg-black/20 rounded-lg p-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 cursor-pointer"
                    style={{ backgroundColor: subject.color }}
                    title="Subject color"
                  />
                  <input
                    type="text"
                    value={subject.name}
                    onChange={(e) => updateSubject(index, 'name', e.target.value)}
                    className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Subject name"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400">Students:</label>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={subject.studentCount}
                      onChange={(e) => updateSubject(index, 'studentCount', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => removeSubject(index)}
                    className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                    title="Remove subject"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={generateArrangement}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-lg font-semibold shadow-lg shadow-blue-900/50 transition-all hover:scale-105 active:scale-95"
          >
            🎲 Generate Seating Arrangement
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">{result.totalStudents}</p>
                <p className="text-sm text-gray-400">Total Students</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{result.rooms.length}</p>
                <p className="text-sm text-gray-400">Rooms</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-purple-400">{result.totalSeats}</p>
                <p className="text-sm text-gray-400">Total Seats</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{result.warnings.length}</p>
                <p className="text-sm text-gray-400">Conflicts</p>
              </div>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4">
                <h3 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Warnings ({result.warnings.length})
                </h3>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {result.warnings.slice(0, 10).map((w, i) => (
                    <p key={i} className="text-sm text-amber-200/80">• {w}</p>
                  ))}
                  {result.warnings.length > 10 && (
                    <p className="text-sm text-amber-300">...and {result.warnings.length - 10} more</p>
                  )}
                </div>
              </div>
            )}

            {/* Room Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
              >
                {showLegend ? '🔽 Hide' : '▶ Show'} Legend
              </button>
              {result.rooms.map((room, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveRoom(idx)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeRoom === idx
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </div>

            {/* Legend */}
            {showLegend && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Subject Legend</h3>
                <div className="flex flex-wrap gap-3">
                  {subjects.map((subject, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: subject.color }} />
                      <span className="text-sm text-gray-300">{subject.name} ({subject.studentCount})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seating Grid */}
            {result.rooms[activeRoom] && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{result.rooms[activeRoom].name}</h3>
                  <div className="text-sm text-gray-400">
                    {result.rooms[activeRoom].rows} × {result.rooms[activeRoom].cols} seats
                  </div>
                </div>

                {/* Front label */}
                <div className="text-center mb-4">
                  <div className="inline-block bg-gray-700/50 px-8 py-1 rounded text-sm text-gray-400 border border-gray-600/50">
                    📋 FRONT (Invigilator)
                  </div>
                </div>

                {/* Grid */}
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    {result.rooms[activeRoom].seats.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex justify-center gap-1 mb-1">
                        <span className="w-8 flex items-center justify-center text-xs text-gray-500">R{rowIdx + 1}</span>
                        {row.map((seat, colIdx) => (
                          <div
                            key={colIdx}
                            className="relative group"
                          >
                            <div
                              className={`w-12 h-10 rounded flex items-center justify-center text-xs font-medium border transition-all ${
                                seat.student
                                  ? 'border-white/20 shadow-sm'
                                  : 'bg-gray-800/50 border-gray-700/50'
                              }`}
                              style={{
                                backgroundColor: seat.student ? seat.student.color + '30' : undefined,
                                borderColor: seat.student ? seat.student.color + '60' : undefined,
                              }}
                            >
                              {seat.student ? (
                                <span className="text-white truncate px-1" style={{ fontSize: '9px' }}>
                                  {seat.student.rollNo.split('-')[1]}
                                </span>
                              ) : (
                                <span className="text-gray-600">—</span>
                              )}
                            </div>
                            {/* Tooltip */}
                            {seat.student && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                <div className="bg-gray-900 border border-white/20 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                                  <p className="font-bold text-white">{seat.student.rollNo}</p>
                                  <p style={{ color: seat.student.color }}>{seat.student.subject}</p>
                                  <p className="text-gray-400">Row {seat.row + 1}, Seat {seat.col + 1}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Room Stats */}
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-sm">
                  <span className="text-gray-400">
                    Occupied: <span className="text-white font-medium">
                      {result.rooms[activeRoom].seats.flat().filter(s => s.student).length}
                    </span> / {result.rooms[activeRoom].rows * result.rooms[activeRoom].cols}
                  </span>
                  <span className="text-gray-400">
                    Empty: <span className="text-white font-medium">
                      {result.rooms[activeRoom].seats.flat().filter(s => !s.student).length}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Print Button */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Arrangement
              </button>
              <button
                onClick={generateArrangement}
                className="px-6 py-2.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🪑</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Configure & Generate</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Set up your rooms and subjects above, then click "Generate Seating Arrangement" to create an optimal seating plan where students of the same subject won't sit together.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <div className="text-2xl mb-2">🔀</div>
                <p className="text-sm text-gray-400">Smart distribution algorithm separates same-subject students</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <div className="text-2xl mb-2">🏫</div>
                <p className="text-sm text-gray-400">Multi-room support with balanced allocation</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <div className="text-2xl mb-2">🖨️</div>
                <p className="text-sm text-gray-400">Print-ready seating charts for each room</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/5 py-6 text-center text-sm text-gray-500">
        <p>Exam Seating Arrangement System • Anti-Cheating Distribution</p>
      </footer>
    </div>
  );
}

export default App;
