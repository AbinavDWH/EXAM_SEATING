interface Subject {
  name: string;
  count: number;
  color: string;
}

interface Config {
  rooms: number;
  rowsPerRoom: number;
  colsPerRoom: number;
  subjects: Subject[];
}

interface ConfigPanelProps {
  config: Config;
  onConfigChange: (config: Config) => void;
  onAddSubject: () => void;
  onRemoveSubject: (index: number) => void;
  onUpdateSubject: (index: number, field: string, value: string | number) => void;
  onGenerate: () => void;
}

export default function ConfigPanel({
  config,
  onConfigChange,
  onAddSubject,
  onRemoveSubject,
  onUpdateSubject,
  onGenerate,
}: ConfigPanelProps) {
  const totalStudents = config.subjects.reduce((sum, s) => sum + s.count, 0);
  const totalSeats = config.rooms * config.rowsPerRoom * config.colsPerRoom;

  return (
    <div className="space-y-6">
      {/* Room Configuration */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-blue-400">🏫</span> Room Configuration
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Number of Rooms
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.rooms}
              onChange={(e) =>
                onConfigChange({ ...config, rooms: parseInt(e.target.value) || 1 })
              }
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Rows
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={config.rowsPerRoom}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    rowsPerRoom: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Columns
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={config.colsPerRoom}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    colsPerRoom: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-3 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Total Seats:</span>
              <span className="font-bold text-white">{totalSeats}</span>
            </div>
            <div className="flex justify-between text-slate-300 mt-1">
              <span>Total Students:</span>
              <span className={`font-bold ${totalStudents > totalSeats ? 'text-red-400' : 'text-green-400'}`}>
                {totalStudents}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Configuration */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-purple-400">📚</span> Subjects & Students
        </h2>

        <div className="space-y-3">
          {config.subjects.map((subject, index) => (
            <div
              key={index}
              className="bg-slate-700/30 rounded-xl p-3 border border-slate-600/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subject.color }}
                />
                <input
                  type="text"
                  value={subject.name}
                  onChange={(e) => onUpdateSubject(index, 'name', e.target.value)}
                  placeholder="Subject name"
                  className="flex-1 bg-transparent border-none text-white text-sm font-medium focus:outline-none placeholder-slate-500"
                />
                <button
                  onClick={() => onRemoveSubject(index)}
                  className="text-slate-400 hover:text-red-400 transition-colors text-sm"
                  title="Remove subject"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">Students:</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={subject.count}
                  onChange={(e) =>
                    onUpdateSubject(index, 'count', parseInt(e.target.value) || 1)
                  }
                  className="w-20 bg-slate-600/50 border border-slate-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onAddSubject}
          className="mt-3 w-full py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-400 transition-colors text-sm"
        >
          + Add Subject
        </button>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={config.subjects.length === 0 || config.subjects.some(s => !s.name)}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        🎲 Generate Arrangement
      </button>

      {/* PHP Backend Info */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
          <span className="text-purple-400">⚡</span> PHP Backend API
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          This app uses a PHP backend at <code className="bg-slate-700 px-1.5 py-0.5 rounded text-purple-300">/api/seating.php</code> for
          server-side processing. The JavaScript algorithm runs client-side for instant results.
        </p>
      </div>
    </div>
  );
}
