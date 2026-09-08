import { useState, useCallback } from 'react';
import ConfigPanel from './components/ConfigPanel';
import SeatingDisplay from './components/SeatingDisplay';
import SummaryStats from './components/SummaryStats';
import Header from './components/Header';
import { arrangeSeating, SeatingResult } from './js/seatingAlgorithm';

const SUBJECT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
  '#84CC16', '#6366F1', '#14B8A6', '#E11D48',
];

interface SubjectConfig {
  name: string;
  count: number;
  color: string;
}

interface AppConfig {
  rooms: number;
  rowsPerRoom: number;
  colsPerRoom: number;
  subjects: SubjectConfig[];
}

export default function App() {
  const [config, setConfig] = useState<AppConfig>({
    rooms: 3,
    rowsPerRoom: 5,
    colsPerRoom: 6,
    subjects: [
      { name: 'Mathematics', count: 30, color: SUBJECT_COLORS[0] },
      { name: 'Physics', count: 25, color: SUBJECT_COLORS[1] },
      { name: 'Chemistry', count: 20, color: SUBJECT_COLORS[2] },
    ],
  });

  const [result, setResult] = useState<SeatingResult | null>(null);
  const [activeRoom, setActiveRoom] = useState(0);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerate = useCallback(() => {
    const algorithmConfig = {
      rooms: config.rooms,
      rowsPerRoom: config.rowsPerRoom,
      colsPerRoom: config.colsPerRoom,
      subjects: config.subjects.map(s => ({ name: s.name, count: s.count })),
    };

    const seatingResult = arrangeSeating(algorithmConfig);

    // Attach colors to students in the result
    const colorMap: Record<string, string> = {};
    config.subjects.forEach(s => { colorMap[s.name] = s.color; });

    seatingResult.rooms.forEach(room => {
      room.grid.forEach(row => {
        row.forEach((seat, colIdx) => {
          if (seat) {
            row[colIdx] = { ...seat, color: colorMap[seat.subject] || '#6B7280' };
          }
        });
      });
    });

    if (seatingResult.unassigned) {
      seatingResult.unassigned = seatingResult.unassigned.map(s => ({
        ...s,
        color: colorMap[s.subject] || '#6B7280',
      }));
    }

    setResult(seatingResult);
    setActiveRoom(0);
    setIsGenerated(true);
  }, [config]);

  const handleConfigChange = (newConfig: AppConfig) => {
    setConfig(newConfig);
    setIsGenerated(false);
  };

  const addSubject = () => {
    const colorIdx = config.subjects.length % SUBJECT_COLORS.length;
    setConfig({
      ...config,
      subjects: [
        ...config.subjects,
        { name: '', count: 20, color: SUBJECT_COLORS[colorIdx] },
      ],
    });
    setIsGenerated(false);
  };

  const removeSubject = (index: number) => {
    setConfig({
      ...config,
      subjects: config.subjects.filter((_: SubjectConfig, i: number) => i !== index),
    });
    setIsGenerated(false);
  };

  const updateSubject = (index: number, field: string, value: string | number) => {
    const newSubjects = [...config.subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setConfig({ ...config, subjects: newSubjects });
    setIsGenerated(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Configuration */}
          <div className="lg:col-span-1">
            <ConfigPanel
              config={config}
              onConfigChange={handleConfigChange}
              onAddSubject={addSubject}
              onRemoveSubject={removeSubject}
              onUpdateSubject={updateSubject}
              onGenerate={handleGenerate}
            />
          </div>

          {/* Right Content - Seating Display */}
          <div className="lg:col-span-2 space-y-6">
            {isGenerated && result ? (
              <>
                <SummaryStats result={result} />
                <SeatingDisplay
                  result={result}
                  activeRoom={activeRoom}
                  setActiveRoom={setActiveRoom}
                  subjects={config.subjects}
                />
              </>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-12 text-center">
                <div className="text-6xl mb-4">🪑</div>
                <h2 className="text-2xl font-bold text-white mb-2">Ready to Arrange</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  Configure your exam rooms and subjects on the left panel, then click
                  <span className="text-blue-400 font-semibold"> "Generate Arrangement"</span> to create the seating plan.
                </p>
                <div className="mt-6 bg-slate-700/50 rounded-xl p-4 max-w-sm mx-auto">
                  <p className="text-sm text-slate-300">
                    <span className="text-yellow-400 font-semibold">🔒 Anti-Cheating:</span> Students of the same subject will NOT sit adjacent to each other.
                  </p>
                </div>
                <div className="mt-4 text-xs text-slate-500">
                  Tech Stack: React (UI) + JavaScript (Algorithm) + PHP (Backend API)
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>Exam Seating Arrangement System • Built with React + PHP + JavaScript</p>
          <p className="mt-1 text-xs text-slate-500">
            PHP Backend: <code className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">/api/seating.php</code>
          </p>
        </div>
      </footer>
    </div>
  );
}
